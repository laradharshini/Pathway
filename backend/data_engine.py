import pandas as pd
import os
import ast
import requests
import re

class DataEngine:
    def __init__(self, data_path="data"):
        self.data_path = data_path
        self.postings_path = os.path.join(data_path, "postings.csv")
        self.job_skills_path = os.path.join(data_path, "jobs", "job_skills.csv")
        self.skills_mapping_path = os.path.join(data_path, "mappings", "skills.csv")
        self.processed_path = os.path.join(data_path, "processed_jobs.pkl")
        
        # Common tech skills for extraction if doing real-time fetching
        self.common_skills = {
            'python', 'java', 'javascript', 'react', 'node.js', 'sql', 'aws', 'docker', 
            'kubernetes', 'machine learning', 'data science', 'html', 'css', 'typescript',
            'go', 'rust', 'c++', 'c#', 'azure', 'gcp', 'linux', 'git', 'agile', 'scrum',
            'jira', 'figma', 'product management', 'marketing', 'seo', 'sales', 'excel'
        }

    def load_data(self, samples=None):
        """
        Loads data from API (Real) + Local CSVs (Legacy) + Mock (Fallback)
        """
        print(f"Loading data...")
        
        real_df = pd.DataFrame()
        
        # 1. Try The Muse API (Real Feed)
        # No keys required for standard public access
        try:
            print("Trying The Muse API...")
            real_jobs = self._fetch_themuse_jobs()
            if real_jobs:
                real_df = pd.DataFrame(real_jobs)
                print(f"✅ Loaded {len(real_df)} real jobs from The Muse.")
        except Exception as e:
            print(f"Muse API Error: {e}")

        # 2. Load Local Legacy Data (if exists)
        legacy_df = pd.DataFrame()
        if os.path.exists(self.postings_path):
            legacy_df = self._load_local_csv(samples)
        
        # 3. Merge
        full_df = pd.concat([real_df, legacy_df], ignore_index=True)
        
        # 4. Diversity Seeding (if strictly relying on local/mock)
        if len(full_df) < 50:
            print("Injecting diversity seed jobs...")
            mock_jobs = self._generate_mock_jobs()
            mock_df = pd.DataFrame(mock_jobs)
            full_df = pd.concat([full_df, mock_df], ignore_index=True)
            
        # 5. Finalize Schema
        full_df['mapped_skills'] = full_df['mapped_skills'].apply(lambda d: d if isinstance(d, list) else [])
        full_df['formatted_experience_level'] = full_df['formatted_experience_level'].fillna('Not Specified')
        
        # Create Search Text
        full_df['search_text'] = (
            full_df['title'].fillna('') + " " + 
            full_df['company_name'].fillna('') + " " + 
            full_df['description'].fillna('')
        ).str.lower()
        
        print(f"Total Jobs Available: {len(full_df)}")
        return full_df

    def search_jobs(self, query, location=None, page=1):
        """
        Real-time job search using The Muse API.
        """
        results = []
        print(f"🎵 Searching The Muse: Query='{query}', Location='{location}'")
        
        try:
            # The Muse API params
            # Map user roles to Muse Categories
            category_map = {
                'data scientist': 'Data and Analytics',
                'data analyst': 'Data and Analytics',
                'software engineer': 'Software Engineering',
                'software developer': 'Software Engineering',
                'full stack developer': 'Software Engineering',
                'product manager': 'Product Management',
                'designer': 'Design',
                'ux designer': 'Design',
                'ui designer': 'Design'
            }
            
            muse_category = category_map.get(query.lower(), "Software Engineering") # Default
            
            # If query is not in map, maybe try using it as a keyword search instead of category?
            # But search_jobs logic assumes category currently. 
            # Let's stick to mapped category + strict default for now to ensure results.

            params = {
                'category': muse_category,
                'page': page
            }
            if location:
                params['location'] = location

            response = requests.get("https://www.themuse.com/api/public/jobs", params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                for item in data.get('results', []):
                    # Extract description content (Muse returns HTML)
                    desc_html = item.get('contents', '')
                    # Simple cleanup of HTML tags for text search
                    desc_text = re.sub('<[^<]+?>', ' ', desc_html)
                    
                    # Extract skills
                    skills = self._extract_skills_from_text(desc_text)
                    
                    # Locations
                    loc = "Remote"
                    if item.get('locations'):
                        loc = item.get('locations')[0].get('name')

                    results.append({
                        'job_id': str(item.get('id')),
                        'title': item.get('name'),
                        'company_name': item.get('company', {}).get('name', 'Confidential Company'),
                        'location': loc,
                        'description': desc_text[:1000] + "...", 
                        'full_description': desc_text, # Keep full for deep analysis
                        'formatted_experience_level': item.get('levels', [{'name': 'Entry'}])[0].get('name'),
                        'salary_disp': "Competitive", 
                        'mapped_skills': skills,
                        'is_active': True,
                        'job_url': item.get('refs', {}).get('landing_page'),
                        'source': 'The Muse'
                    })
            else:
                print(f"The Muse API returned {response.status_code}")
                
        except Exception as e:
            print(f"The Muse Search Error: {e}")
            
        return results

    def _fetch_themuse_jobs(self):
        """Legacy batch fetcher - delegates to search_jobs now to reuse logic"""
        all_results = []
        categories = ["Software Engineering", "Design", "Data and Analytics", "Product Management"]
        for cat in categories:
            results = self.search_jobs(query=cat)
            all_results.extend(results)
        return all_results

    def _extract_skills_from_text(self, text):
        """
        Robust skill extraction using keyword matching.
        """
        found = set()
        text_lower = text.lower()
        
        # Extended dictionary for better matching
        keywords = {
            'Python': ['python'],
            'Java': ['java', 'jvm'],
            'JavaScript': ['javascript', 'js', 'es6'],
            'React': ['react', 'reactjs'],
            'Node.js': ['node.js', 'nodejs', 'node'],
            'SQL': ['sql', 'mysql', 'postgresql', 'postgres'],
            'AWS': ['aws', 'amazon web services'],
            'Docker': ['docker', 'container'],
            'Kubernetes': ['kubernetes', 'k8s'],
            'Machine Learning': ['machine learning', 'ml', 'ai'],
            'Data Analysis': ['data analysis', 'analytics'],
            'Go': ['golang', 'go lang'],
            'Rust': ['rust'],
            'C++': ['c++'],
            'Git': ['git', 'github'],
            'Agile': ['agile', 'scrum'],
            'Communication': ['communication', 'verbal', 'written'],
            'Teamwork': ['teamwork', 'collaboration'],
            'Figma': ['figma', 'sketch'],
            'Marketing': ['marketing', 'seo', 'sem'],
            'Sales': ['sales', 'selling']
        }

        for skill, patterns in keywords.items():
            for pattern in patterns:
                # Use word boundary to avoid partial matches (e.g. 'go' in 'good')
                if re.search(r'\b' + re.escape(pattern) + r'\b', text_lower):
                    found.add(skill)
                    break # Found this skill, move to next

        # Fallbacks based on context if strictly nothing found
        if not found:
            if 'software' in text_lower or 'developer' in text_lower:
                found.update(['Software Engineering', 'Git'])
            elif 'design' in text_lower:
                found.update(['Design', 'Figma'])
            elif 'data' in text_lower:
                found.update(['Data Analysis', 'SQL'])
            else:
                found.update(['Communication', 'Teamwork'])
        
        return list(found)
        
    def _load_local_csv(self, samples):
        return pd.DataFrame()

    def _generate_mock_jobs(self):
        """Generates diverse jobs to ensure the app works for non-DS roles."""
        roles = [
            ("Senior Product Designer", "Design", ["Figma", "UI/UX", "Prototyping", "User Research"]),
            ("Software Engineer", "Engineering", ["Java", "Spring Boot", "AWS", "System Design"]),
            ("Marketing Manager", "Marketing", ["SEO", "Content Strategy", "Google Analytics", "Social Media"]),
            ("Financial Analyst", "Finance", ["Excel", "Financial Modeling", "Forecasting", "Accounting"]),
            ("Project Manager", "Management", ["Agile", "Scrum", "JIRA", "Stakeholder Management"]),
            ("Sales Representative", "Sales", ["CRM", "Negotiation", "Lead Generation", "Communication"]),
            ("HR Specialist", "Human Resources", ["Recruiting", "Employee Relations", "Onboarding", "HRIS"])
        ]
        
        mock_data = []
        import random
        for i in range(20): 
            role, dept, skills = random.choice(roles)
            mock_data.append({
                'job_id': f'mock_{i}',
                'title': role,
                'company_name': f"{dept} Corp {i}",
                'location': random.choice(['Remote', 'New York, NY', 'San Francisco, CA', 'London, UK']),
                'description': f"We are looking for a {role} to join our {dept} team. You will use {', '.join(skills)}.",
                'formatted_experience_level': random.choice(['Entry level', 'Mid-Senior level', 'Director']),
                'mapped_skills': skills,
                'salary_disp': f"${random.randint(60, 150)}k/year",
                'is_active': True
            })
        return mock_data

if __name__ == "__main__":
    # Test run
    engine = DataEngine()
    df = engine.load_data()
    print(df.head())
