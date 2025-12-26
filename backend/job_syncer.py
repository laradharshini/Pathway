import time
import random
from apscheduler.schedulers.background import BackgroundScheduler
from database import jobs_collection

class JobSyncer:
    def __init__(self, socketio, matcher):
        self.socketio = socketio
        self.matcher = matcher
        self.scheduler = BackgroundScheduler()
        
    def start(self):
        """Start the background scheduler"""
        print("⏳ Job Syncer: Starting background scheduler...")
        self.scheduler.add_job(self.sync_jobs, 'interval', seconds=30) # 30s for demo
        self.scheduler.start()
        
    def sync_jobs(self):
        """Mock job fetching logic (simulating real API)"""
        print("🔄 Job Syncer: Checking for new postings...")
        
        # Simulate finding a "Live" job
        if random.random() > 0.7: # 30% chance
            new_job = self._generate_live_job()
            print(f"✨ NEW JOB FOUND: {new_job['title']} at {new_job['company_name']}")
            
            # 1. Save to DB
            result = jobs_collection.insert_one(new_job)
            new_job_id = str(result.inserted_id)
            new_job['job_id'] = new_job_id
            
            # 2. Add to Matcher Engine (Memory)
            # In a real system, we'd update the DataFrame incrementally.
            # Here we might need to reload or append.
            # self.matcher.add_job(new_job) # Hypothetical method
            
            # 3. Broadcast Event
            # "Someone just posted a job!"
            self.socketio.emit('new_job_alert', {
                'title': new_job['title'],
                'company': new_job['company_name'],
                'location': new_job['location']
            })
            
    def _generate_live_job(self):
        titles = ["React Developer", "Data Engineer", "UX Researcher", "Product Owner"]
        companies = ["TechFlow", "DataCorp", "CreativeMinds", "InnovateX"]
        
        return {
            "title": random.choice(titles),
            "company_name": random.choice(companies),
            "location": "Remote (Live)",
            "description": "This is a live job posting fetched just now.",
            "skills": ["React", "Python", "Agile"],
            "experience_level": "Mid-Senior level",
            "is_active": True,
            "posted_at": time.time()
        }
