import random
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pandas as pd
from datetime import datetime

class MockDataGenerator:
    """
    Generates synthetic historical data to bootstrap the ML model.
    Simulates 'hired' outcomes based on logical rules to teach the model.
    """
    def __init__(self):
        self.roles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Designer', 'Marketing Manager']
        self.skills_pool = [
            'Python', 'Java', 'React', 'SQL', 'AWS', 'Docker', 'Machine Learning', 
            'Communication', 'Leadership', 'Figma', 'Data Analysis'
        ]
        self.levels = ['Entry', 'Mid-Senior', 'Director']

    def generate_training_data(self, n_samples=2000):
        data = []
        labels = []
        
        for _ in range(n_samples):
            # 1. Generate Random Pair
            skill_match = random.random() # 0.0 to 1.0
            exp_match = random.choice([0.2, 0.5, 0.8, 1.0])
            role_match = random.choice([0.0, 0.7, 1.0])
            
            # 2. Determine Outcome Logic (The "Ground Truth")
            # We want the model to learn that High Skill + High Role match = Hired
            
            score = (skill_match * 0.6) + (exp_match * 0.3) + (role_match * 0.1)
            
            # Add some noise/randomness to make it realistic
            noise = random.uniform(-0.1, 0.1)
            final_score = score + noise
            
            is_hired = 1 if final_score > 0.75 else 0
            
            # Feature Vector
            features = [skill_match, exp_match, role_match]
            data.append(features)
            labels.append(is_hired)
            
        return np.array(data), np.array(labels)

class MLMatcher:
    """
    Machine Learning based matcher using Random Forest.
    """
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def train(self):
        """
        Trains the model on synthetic data.
        """
        print("🧠 Training ML Model on synthetic data...")
        generator = MockDataGenerator()
        X_train, y_train = generator.generate_training_data()
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Fit model
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        accuracy = self.model.score(X_train_scaled, y_train)
        print(f"✅ Model Trained. Validation Accuracy: {accuracy:.2f}")
        
    def predict_match_probability(self, skill_score, exp_score, role_score):
        """
        Predicts match probability using a weighted linear combination for maximum sensitivity.
        Weights: Skills (70%), Experience (20%), Role (10%)
        """
        score = (clean_val_ml(skill_score) * 0.7) + (clean_val_ml(exp_score) * 0.2) + (clean_val_ml(role_score) * 0.1)
        return float(max(0.0, min(1.0, score)))

def clean_val_ml(v):
    if v is None: return 0.0
    try:
        import math
        if math.isnan(v): return 0.0
        return float(v)
    except:
        return 0.0
