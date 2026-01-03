import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from ml_engine import MLMatcher

class CareerMatcher:
    def __init__(self, data_engine):
        self.data_engine = data_engine
        self.df = None
        self.tfidf = None
        self.tfidf_matrix = None
        # Weights from the prompt
        self.weights = {
            'skill_fit': 0.40,
            'experience_fit': 0.25,
            'role_alignment': 0.15,
            'personality_support': 0.10,
            'market_demand': 0.10
        }
        # Initialize ML Engine
        self.ml_matcher = MLMatcher()
        # Predefined Skill Weights (Market Demand / Importance)
        self.skill_weights = {
            'python': 1.5, 'java': 1.3, 'react': 1.4, 'sql': 1.2,
            'amazon web services': 1.8, 'azure': 1.6, 'docker': 1.5,
            'kubernetes': 1.9, 'machine learning': 2.0, 'javascript': 1.3,
            'node': 1.4, 'typescript': 1.4, 'terraform': 1.7, 'go': 1.6,
            'rust': 1.5, 'c++': 1.4, 'mongodb': 1.3, 'postgres': 1.3, 'graphql': 1.2
        }

    def train(self):
        """Pre-computes TF-IDF and loads data from both CSV and MongoDB."""
        # Load CSV jobs
        self.df = self.data_engine.load_data(samples=5000)
        # self.data_engine.save_processed(self.df) # removed caching for now as it caused issues
        
        # Load MongoDB jobs and merge
        try:
            from database import jobs_collection, company_profiles_collection
            from bson import ObjectId
            
            mongo_jobs = list(jobs_collection.find({'is_active': True}))
            
            if mongo_jobs:
                print(f"Loading {len(mongo_jobs)} jobs from MongoDB...")
                
                # Convert MongoDB jobs to DataFrame format
                mongo_rows = []
                for job in mongo_jobs:
                    # Get company info
                    company = company_profiles_collection.find_one({'_id': ObjectId(job['company_id'])})
                    company_name = company['company_name'] if company else 'Unknown Company'
                    
                    mongo_rows.append({
                        'job_id': str(job['_id']),
                        'title': job['title'],
                        'company': company_name,
                        'description': job['description'],
                        'location': job.get('location', 'Remote'),
                        'formatted_experience_level': job.get('experience_level', 'entry'),
                        'mapped_skills': job.get('mapped_skills') or job.get('skills') or [],
                        'search_text': f"{job['title']} {job['description']} {' '.join(job.get('mapped_skills') or job.get('skills') or [])}",
                        'source': 'mongodb'
                    })
                
                mongo_df = pd.DataFrame(mongo_rows)
                
                # Add source column to CSV jobs
                self.df['source'] = 'csv'
                
                # Merge DataFrames
                self.df = pd.concat([self.df, mongo_df], ignore_index=True)
                print(f"Total jobs: {len(self.df)} (CSV + MongoDB)")
        
        except Exception as e:
            print(f"Could not load MongoDB jobs: {e}")
            print("Continuing with CSV jobs only...")
        
        print("Training intelligence models...")
        self.tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
        self.df['search_text'] = self.df['search_text'].fillna('')
        self.df['search_text'] = self.df['search_text'].fillna('')
        self.tfidf_matrix = self.tfidf.fit_transform(self.df['search_text'])
        
        # Train ML Model
        self.ml_matcher.train()
        print("Models trained.")

    def normalize_skills(self, skill_list):
        """Normalize skills to lowercase and map synonyms for better matching."""
        synonyms = {
            'js': 'javascript',
            'reactjs': 'react',
            'react.js': 'react',
            'node.js': 'node',
            'nodejs': 'node',
            'py': 'python',
            'ml': 'machine learning',
            'ai': 'artificial intelligence',
            'aws': 'amazon web services',
            'excel': 'microsoft excel'
        }
        
        normalized = set()
        for s in skill_list:
            # Handle both string and dict formats
            skill_name = s['name'] if isinstance(s, dict) else s
            clean = skill_name.lower().strip()
            
            # Check direct map
            if clean in synonyms:
                normalized.add(synonyms[clean])
            else:
                normalized.add(clean)
                
        return normalized
    
    def calculate_skill_confidence(self, skill):
        """
        Calculate confidence score (0-1) based on proficiency level.
        Higher confidence = stronger skill match weight.
        """
        if isinstance(skill, str):
            return 0.6  # Default for legacy string-only skills
        
        proficiency_map = {
            'beginner': 0.4,
            'intermediate': 0.7,
            'advanced': 0.9,
            'expert': 1.0
        }
        
        return proficiency_map.get(skill.get('proficiency', 'intermediate'), 0.7)

    def get_skill_weight(self, skill_name):
        """Get relative weight of a skill, default to 1.0"""
        norm_skill = list(self.normalize_skills([skill_name]))[0]
        return self.skill_weights.get(norm_skill, 1.0)

    def calculate_skill_score(self, user_skills, job_skills):
        """
        Calculate weighted skill fit score based on confidence levels and skill importance.
        Returns: (base_score, missing_skills, confidence_weighted_score)
        """
        # Normalize job skills (always strings)
        job_set = self.normalize_skills(job_skills)
        
        if not job_set:
            return 0.0, [], 0.0  # Zero score if job has no skills listed (unlikely with extraction)
        
        # Build user skill map with confidence
        user_skill_map = {}
        for skill in user_skills:
            if isinstance(skill, dict):
                normalized_name = list(self.normalize_skills([skill['name']]))[0]
                user_skill_map[normalized_name] = self.calculate_skill_confidence(skill)
            else:
                # Legacy string format
                normalized_name = list(self.normalize_skills([skill]))[0]
                user_skill_map[normalized_name] = 0.6
        
        user_set = set(user_skill_map.keys())
        
        # Calculate Weighted Totals
        total_job_weight = sum(self.get_skill_weight(s) for s in job_set)
        matched_job_weight = 0
        confidence_weighted_match = 0
        
        intersection = user_set.intersection(job_set)
        missing = list(job_set - user_set)
        
        for skill in intersection:
            weight = self.get_skill_weight(skill)
            confidence = user_skill_map[skill]
            matched_job_weight += weight
            confidence_weighted_match += (weight * confidence)

        # Base score (coverage) weighted by importance
        weighted_coverage = matched_job_weight / total_job_weight if total_job_weight > 0 else 0
        
        # Confidence bonus: how well do you know the matched skills
        # Maximum possible weighted confidence is if all matched skills were at 1.0 confidence
        max_matched_confidence = matched_job_weight * 1.0
        confidence_factor = confidence_weighted_match / max_matched_confidence if max_matched_confidence > 0 else 0
        
        # Final score combines coverage and confidence
        # We give more weight to having the skill at all (0.7) and some weight to proficiency (0.3)
        final_score = weighted_coverage * (0.7 + 0.3 * confidence_factor)
        
        return min(weighted_coverage, 1.0), missing, min(final_score, 1.0)

    def calculate_experience_score(self, user_level, job_level):
        """
        Simple heuristic for experience match.
        user_level: 'Entry', 'Associate', 'Mid-Senior', 'Director'
        job_level: string from dataset
        """
        # Map levels to numeric for distance calculation
        levels = {
            'Internship': 0,
            'Entry level': 1,
            'Associate': 2,
            'Mid-Senior level': 3,
            'Director': 4,
            'Executive': 5,
            'Not Specified': 1 # Assume entry level if unknown
        }
        
        u_val = levels.get(user_level, 1)
        j_val = levels.get(job_level, 1) # Default to 1
        
        diff = abs(u_val - j_val)
        
        if diff == 0: return 1.0
        if diff == 1: return 0.8
        if diff == 2: return 0.5
        return 0.2

    def generate_interview_questions(self, missing_skills):
        """
        Generates simple behavioral/technical questions for missing skills.
        """
        questions = []
        templates = [
            "How would you use {skill} to solve a complex data problem?",
            "Describe a project where you implemented {skill}.",
            "What are the key limitations of {skill} in a production environment?",
            "How do you stay updated with the latest changes in {skill}?"
        ]
        
        import random
        for skill in missing_skills[:3]: # Limit to top 3 missing
            q = random.choice(templates).format(skill=skill)
            questions.append({'skill': skill, 'question': q})
            
        return questions

    def match_user(self, profile, live_jobs=None):
        """
        Main scoring function.
        profile: dict with keys ['skills', 'experience_level', 'preferred_role']
        live_jobs: list of job dicts (optional). If provided, scores these instead of self.df
        """
        results = []
        
        # Determine source of jobs
        candidates = []
        if live_jobs:
            candidates = live_jobs
        elif self.df is not None:
             # Ensure no NaNs before conversion
             clean_df = self.df.fillna('')
             candidates = clean_df.to_dict('records')
        
        # Pre-compute query vec if strictly using TF-IDF locally (less relevant for live API but useful for Hybrid)
        # For live jobs, we'll do simpler text matching for role score to avoid retraining TF-IDF every request
        
        for job in candidates:
            try:
                # 1. Skill Match (Weight: 0.5)
                # base_skill_score is strict coverage (0.0 to 1.0)
                base_skill_score, missing_skills, weighted_skill_score = self.calculate_skill_score(
                    profile['skills'], job.get('mapped_skills') or job.get('skills') or []
                )
                
                # 2. Experience Fit (Weight: 0.3)
                exp_score = self.calculate_experience_score(
                    profile.get('experience_level', 'Entry Level'), 
                    job.get('formatted_experience_level', 'Entry Level')
                )
                
                # 3. Role Alignment (Weight: 0.2)
                # If live job, simpler keyword match since TF-IDF matrix isn't built for it
                role_score = 0.0 # Default to no match
                target_role = profile.get('preferred_role', '').lower()
                job_title = str(job.get('title', '')).lower()
                
                if target_role in job_title: 
                    role_score = 1.0
                elif any(word in job_title for word in target_role.split()):
                    role_score = 0.7
                
                # ========== READINESS FORMULA ==========
                # Ensure values are within [0, 1] and non-NaN
                def clean_val(v, default=0.0):
                    if v is None: return default
                    try:
                        import math
                        import numpy as np
                        if math.isnan(v) or np.isnan(v): return default
                        return max(0.0, min(1.0, float(v)))
                    except:
                        return default

                s_score = clean_val(weighted_skill_score)
                e_score = clean_val(exp_score)
                r_score = clean_val(role_score)
                
                # ML Prediction
                readiness_score = self.ml_matcher.predict_match_probability(s_score, e_score, r_score)
                
                # Final check for readiness_score
                readiness_score = clean_val(readiness_score, default=0.0)
                # ========== INTELLIGENCE LAYER ==========
                
                # 1. Classify job readiness
                job_category = self.classify_job(readiness_score)
                
                # 2. Recommend single best action
                best_action = self.recommend_best_action(missing_skills, job.get('mapped_skills', []))
                
                # 3. Explain readiness score
                readiness_explanation = {
                    'overall': round(readiness_score * 100, 1),
                    'breakdown': [
                        {'label': 'Skills', 'value': round(base_skill_score * 100), 'weight': 0.5},
                        {'label': 'Experience', 'value': round(exp_score * 100), 'weight': 0.3},
                        {'label': 'Role Fit', 'value': round(role_score * 100), 'weight': 0.2}
                    ]
                }

                results.append({
                    'job_id': str(job.get('job_id') or job.get('_id') or 'unknown'),
                    'title': str(job.get('title', 'Unknown Role')),
                    'company': str(job.get('company_name') or job.get('company') or 'Company'),
                    'location': str(job.get('location', 'Remote')),
                    'readiness_score': float(round(readiness_score * 100, 1)), # Used for display
                    'match_score': float(round(readiness_score * 100, 1)), # Logic compatibility
                    'weighted_skill_score': weighted_skill_score,
                    'missing_skills': missing_skills[:5],
                    'required_skills': job.get('mapped_skills', []),
                    'experience_level': str(job.get('formatted_experience_level', 'Entry')),
                    'salary': str(job.get('salary_disp', 'Competitive')),
                    'category': job_category,
                    'best_action': best_action,
                    'readiness_breakdown': readiness_explanation,
                    'source': job.get('source', 'csv')
                })
            except Exception as e:
                print(f"Skipping job {job.get('title', 'unknown')} due to scoring error: {e}")
                continue
            
        # Sort by readiness score
        results.sort(key=lambda x: x['readiness_score'], reverse=True)
        return results
    
    def classify_job(self, readiness_score):
        """
        Classify job into actionable categories based on readiness.
        """
        if readiness_score >= 0.70:
            return {
                'level': 'apply_now',
                'label': 'Apply Now',
                'color': 'success',
                'icon': 'check-circle',
                'message': 'You are ready for this role'
            }
        elif readiness_score >= 0.50:
            return {
                'level': 'apply_soon',
                'label': 'Apply Soon',
                'color': 'warning',
                'icon': 'clock',
                'message': 'Close the skill gap first'
            }
        else:
            return {
                'level': 'skill_up',
                'label': 'Skill Up First',
                'color': 'danger',
                'icon': 'exclamation-triangle',
                'message': 'Significant preparation needed'
            }
    
    def recommend_best_action(self, missing_skills, all_required_skills):
        """
        Recommend ONE single best action to improve match.
        Priority: most frequently required skill that user is missing.
        """
        if not missing_skills:
            return {
                'type': 'ready',
                'message': 'You have all required skills! Focus on interview prep.',
                'skill': None
            }
        
        # For now, recommend the first missing skill
        # In production, this would analyze skill frequency across all jobs
        primary_skill = missing_skills[0]
        
        return {
            'type': 'learn_skill',
            'message': f'Learning {primary_skill} will have the highest impact',
            'skill': primary_skill,
            'priority': 'high' if len(missing_skills) > 2 else 'medium'
        }
    
    def explain_readiness(self, skill_score, exp_score, role_score, readiness_score):
        """
        Provide transparent breakdown of readiness score.
        """
        return {
            'overall': round(readiness_score * 100, 1),
            'components': {
                'skills': {
                    'score': round(skill_score * 100, 1),
                    'weight': '70%',
                    'contribution': round(skill_score * 0.7 * 100, 1)
                },
                'experience': {
                    'score': round(exp_score * 100, 1),
                    'weight': '30%',
                    'contribution': round(exp_score * 0.3 * 100, 1)
                }
            },
            'explanation': self.generate_readiness_explanation(skill_score, exp_score, readiness_score)
        }
    
    def generate_readiness_explanation(self, skill_score, exp_score, readiness_score):
        """
        Generate human-readable explanation of readiness.
        """
        if readiness_score >= 0.70:
            return "Strong match. Your skills and experience align well with this role."
        elif readiness_score >= 0.50:
            if skill_score < 0.6:
                return "You have the right experience level, but need to strengthen your technical skills."
            else:
                return "Your skills are good, but this role requires more experience."
        else:
            if skill_score < 0.4:
                return "Significant skill gaps. Focus on learning the missing technical skills first."
            else:
                return "Your skills are developing, but this role is too senior for your current experience level."


if __name__ == "__main__":
    # Test
    from data_engine import DataEngine
    engine = DataEngine(data_path=r"c:\Users\Lara Dharshini P\pathway\data")
    matcher = CareerMatcher(engine)
    matcher.train()
    
    test_profile = {
        'skills': ['Python', 'SQL', 'Data Analysis'],
        'experience_level': 'Entry level',
        'preferred_role': 'Data Analyst'
    }
    
    matches = matcher.match_user(test_profile)
    print("\nTop Match:")
    print(matches[0])
