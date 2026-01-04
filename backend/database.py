"""
Database connection and models for MongoDB
"""
from pymongo import MongoClient, ASCENDING
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
USE_DEMO_MODE = False
try:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'pathway')

    # Try connection with certifi for SSL robustness
    try:
        import certifi
        ca = certifi.where()
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000, tlsCAFile=ca)
    except ImportError:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)

    client.server_info() # Trigger connection check
    db = client[DATABASE_NAME]
    print("✅ Connected to MongoDB")

except Exception as e:
    # Attempt to handle common URI escaping issues in Render/Cloud environments
    if "Username and password must be escaped" in str(e):
        try:
            print("🔄 Attempting to auto-escape MongoDB credentials...")
            from urllib.parse import quote_plus
            # Robust split: Find the last '@' to separate auth from host
            if '@' in MONGO_URI and '://' in MONGO_URI:
                prefix, rest = MONGO_URI.split('://', 1)
                # Split at the LAST @ to avoid confusion with passwords containing @
                auth, server = rest.rsplit('@', 1)
                if ':' in auth:
                    user, pwd = auth.split(':', 1)
                    MONGO_URI = f"{prefix}://{quote_plus(user)}:{quote_plus(pwd)}@{server}"
                    
                    # Retry with certifi
                    try:
                        import certifi
                        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000, tlsCAFile=certifi.where())
                    except ImportError:
                        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
                        
                    client.server_info()
                    db = client[DATABASE_NAME]
                    print("✅ Connected to MongoDB (Auto-Escaped)")
                    USE_DEMO_MODE = False
                else:
                    raise e
            else:
                raise e
        except Exception as retry_e:
            print(f"❌ MongoDB Auto-Escape failed: {retry_e}")
            print(f"⚠️ MongoDB Unavailable ({e}). Switching to DEMO MODE (In-Memory).")
            USE_DEMO_MODE = True
    else:
        print(f"⚠️ MongoDB Unavailable ({e}). Switching to DEMO MODE (In-Memory).")
        USE_DEMO_MODE = True
    
    # Simple In-Memory DB Simulation
    class DemoCollection:
        def __init__(self): self.data = []
        def create_index(self, keys, unique=False): pass
        def insert_one(self, doc):
            doc['_id'] = str(len(self.data) + 1)
            self.data.append(doc)
            from collections import namedtuple
            Result = namedtuple('Result', ['inserted_id'])
            return Result(doc['_id'])
        def find_one(self, query):
            for doc in self.data:
                if all(doc.get(k) == v for k, v in query.items()): return doc
            return None
        def find(self, query={}):
            if not query: return self.data
            return [d for d in self.data if all(d.get(k) == v for k, v in query.items())]
        def update_one(self, query, update):
            doc = self.find_one(query)
            if doc and '$set' in update:
                doc.update(update['$set'])

    if USE_DEMO_MODE:
        class DemoDB:
            def __init__(self):
                self.collections = {}
            def __getitem__(self, name):
                if name not in self.collections: self.collections[name] = DemoCollection()
                return self.collections[name]

        db = DemoDB()

# Collections (Identical access for both modes)
users_collection = db['users']
candidate_profiles_collection = db['candidate_profiles']
company_profiles_collection = db['company_profiles']
jobs_collection = db['jobs']
applications_collection = db['applications']
user_progress_collection = db['user_progress']
simulations_collection = db['simulations']

def init_db():
    if USE_DEMO_MODE:
        print("✅ Demo Mode Initialized (InMemory)")
        return
        
    """Initialize database with indexes"""
    try:
        # Users indexes
        users_collection.create_index([('email', ASCENDING)], unique=True)
        users_collection.create_index([('role', ASCENDING)])
        
        # Candidate profiles indexes
        candidate_profiles_collection.create_index([('user_id', ASCENDING)], unique=True)
        candidate_profiles_collection.create_index([('experience_level', ASCENDING)])
        
        # Company profiles indexes
        company_profiles_collection.create_index([('user_id', ASCENDING)], unique=True)
        
        # Jobs indexes
        jobs_collection.create_index([('company_id', ASCENDING)])
        jobs_collection.create_index([('is_active', ASCENDING)])
        jobs_collection.create_index([('created_at', ASCENDING)])
        
        # Applications indexes
        applications_collection.create_index([('job_id', ASCENDING)])
        applications_collection.create_index([('candidate_id', ASCENDING)])
        applications_collection.create_index([('job_id', ASCENDING), ('candidate_id', ASCENDING)], unique=True)
        
        print("✅ Database indexes created")
    except Exception as e:
        print(f"Index creation skipped: {e}")

def get_db():
    return db

# User model helpers
class UserModel:
    @staticmethod
    def create(email, password_hash, role):
        """Create new user"""
        user = {
            'email': email,
            'password_hash': password_hash,
            'role': role,
            'is_active': True,
            'created_at': datetime.utcnow()
        }
        result = users_collection.insert_one(user)
        user['_id'] = result.inserted_id
        return user
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        return users_collection.find_one({'email': email})
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID (Safely handles ObjectId vs String)"""
        try:
            from bson import ObjectId
            oid = ObjectId(user_id)
            return users_collection.find_one({'_id': oid})
        except:
            # Fallback for Demo Mode (String IDs)
            return users_collection.find_one({'_id': str(user_id)})

    @staticmethod
    def find_by_firebase_uid(uid):
        """Find user by Firebase UID"""
        return users_collection.find_one({'firebase_uid': uid})

# Candidate profile helpers
class CandidateProfileModel:
    @staticmethod
    def create(user_id, full_name, experience_level, target_role, location):
        """Create candidate profile"""
        profile = {
            'user_id': str(user_id), # Store as string for consistency
            'full_name': full_name,
            'experience_level': experience_level,
            'target_role': target_role,
            'location': location,
            'skills': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = candidate_profiles_collection.insert_one(profile)
        profile['_id'] = result.inserted_id
        return profile
    
    @staticmethod
    def find_by_user_id(user_id):
        # In Demo Mode, query matches directly. In Mongo, it might need ObjectId.
        # But we stored user_id as string in 'create', so find usage should be string.
        return candidate_profiles_collection.find_one({'user_id': str(user_id)})
    
    @staticmethod
    def update(user_id, update_data):
        candidate_profiles_collection.update_one(
            {'user_id': str(user_id)},
            {'$set': update_data}
        )

# Company profile helpers
class CompanyProfileModel:
    @staticmethod
    def create(user_id, company_name, industry, description):
        """Create company profile"""
        profile = {
            'user_id': str(user_id),
            'company_name': company_name,
            'industry': industry,
            'description': description,
            'created_at': datetime.utcnow()
        }
        result = company_profiles_collection.insert_one(profile)
        return profile
    
    @staticmethod
    def find_by_user_id(user_id):
        """Find company profile by user ID"""
        return company_profiles_collection.find_one({'user_id': str(user_id)})

# Job model helpers
class JobModel:
    @staticmethod
    def create(company_id, title, description, requirements, salary_range, location, job_type):
        """Create job posting"""
        job = {
            'company_id': str(company_id),
            'title': title,
            'description': description,
            'requirements': requirements, # List of skills
            'salary_range': salary_range,
            'location': location,
            'job_type': job_type,
            'is_active': True,
            'skills': requirements, # Duplicate for matcher compatibility
            'created_at': datetime.utcnow()
        }
        result = jobs_collection.insert_one(job)
        job['_id'] = result.inserted_id
        return job
    
    @staticmethod
    def find_all():
        return list(jobs_collection.find())
        
    @staticmethod
    def find_active():
        """Find all active jobs"""
        return list(jobs_collection.find({'is_active': True}))
    
    @staticmethod
    def find_by_id(job_id):
        try:
            from bson import ObjectId
            oid = ObjectId(job_id)
            return jobs_collection.find_one({'_id': oid})
        except:
             return jobs_collection.find_one({'_id': str(job_id)})

    @staticmethod
    def find_by_company(company_id):
        """Find jobs by company"""
        return list(jobs_collection.find({'company_id': company_id}))

# Application model helpers
class ApplicationModel:
    @staticmethod
    def create(job_id, candidate_id, readiness_score, match_score, candidate_details=None):
        """Create application"""
        application = {
            'job_id': job_id,
            'candidate_id': candidate_id,
            'readiness_score': readiness_score,
            'match_score': match_score,
            'candidate_details': candidate_details or {},
            'status': 'pending',
            'applied_at': datetime.utcnow()
        }
        result = applications_collection.insert_one(application)
        application['_id'] = result.inserted_id
        return application
    
    @staticmethod
    def find_by_candidate(candidate_id):
        """Find applications by candidate"""
        return list(applications_collection.find({'candidate_id': candidate_id}))
    
    @staticmethod
    def find_by_job(job_id):
        """Find applications by job"""
        return list(applications_collection.find({'job_id': job_id}))
    
    @staticmethod
    def check_existing(job_id, candidate_id):
        """Check if application already exists"""
        return applications_collection.find_one({
            'job_id': job_id, 
            'candidate_id': candidate_id
        })
class UserProgressModel:
    @staticmethod
    def create(user_id):
        """Create initial progress record"""
        progress = {
            'user_id': user_id,
            'xp': 0,
            'level': 1,
            'streak_days': 0,
            'last_active': datetime.utcnow(),
            'completed_assessments': [],
            'achievements': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        db['user_progress'].insert_one(progress)
        return progress

    @staticmethod
    def find_by_user_id(user_id):
        return db['user_progress'].find_one({'user_id': user_id})

    @staticmethod
    def update_xp(user_id, xp_gain):
        """Add XP and check for level up"""
        # Simple level formula: Level = 1 + sqrt(XP / 100)
        progress = db['user_progress'].find_one({'user_id': user_id})
        if not progress:
            progress = UserProgressModel.create(user_id)
        
        new_xp = progress['xp'] + xp_gain
        new_level = int(1 + (new_xp / 100) ** 0.5)
        
        db['user_progress'].update_one(
            {'user_id': user_id},
            {
                '$set': {
                    'xp': new_xp, 
                    'level': new_level,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return new_level > progress['level']

class AchievementModel:
    @staticmethod
    def unlock(user_id, achievement_slug, name, icon):
        """Unlock an achievement"""
        db['user_progress'].update_one(
            {'user_id': user_id, 'achievements.slug': {'$ne': achievement_slug}},
            {
                '$push': {
                    'achievements': {
                        'slug': achievement_slug,
                        'name': name,
                        'icon': icon,
                        'unlocked_at': datetime.utcnow()
                    }
                }
            }
        )

class SimulationModel:
    @staticmethod
    def create(user_id, simulation_id, scenario_name, initial_readiness):
        """Create a new simulation attempt"""
        attempt = {
            'user_id': str(user_id),
            'simulation_id': simulation_id,
            'scenario_name': scenario_name,
            'initial_readiness': initial_readiness,
            'final_readiness': None,
            'status': 'in_progress',
            'decisions': [],
            'justification': '',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = simulations_collection.insert_one(attempt)
        attempt['_id'] = result.inserted_id
        return attempt

    @staticmethod
    def update_result(attempt_id, decisions, final_readiness, justification, evaluation_result=None):
        """Finalize simulation with results"""
        try:
            from bson import ObjectId
            oid = ObjectId(attempt_id)
            query = {'_id': oid}
        except:
            query = {'_id': str(attempt_id)}

        update_fields = {
            'decisions': decisions,
            'final_readiness': final_readiness,
            'justification': justification,
            'status': 'completed',
            'updated_at': datetime.utcnow()
        }
        
        if evaluation_result:
            update_fields['evaluation_result'] = evaluation_result

        simulations_collection.update_one(
            query,
            {'$set': update_fields}
        )

    @staticmethod
    def get_by_user(user_id):
        """Get all simulations for a user"""
        return list(simulations_collection.find({'user_id': str(user_id)}).sort('created_at', -1))

    @staticmethod
    def find_by_id(attempt_id):
        try:
            from bson import ObjectId
            oid = ObjectId(attempt_id)
            return simulations_collection.find_one({'_id': oid})
        except:
            return simulations_collection.find_one({'_id': str(attempt_id)})

if __name__ == '__main__':
    init_db()
