import os
import requests
import ast

class AILabEngine:
    def __init__(self):
        key = os.getenv('ANTHROPIC_API_KEY', '')
        if 'your-anthropic-api-key' in key or not key:
            self.api_key = None
        else:
            self.api_key = key

    def generate_challenge(self, skill, proficiency='intermediate'):
        """Generate a dynamic coding challenge based on skill and proficiency"""
        prompt = f"""Generate a coding challenge for the skill: {skill} at {proficiency} level.
        The challenge should be interactive and educational.
        
        Respond ONLY in valid JSON format with:
        {{
            "title": "Short Descriptive Title",
            "description": "Clear explanation of the problem",
            "starter_code": "The code snippet the user starts with (use \\n for newlines)",
            "test_cases": ["Case 1", "Case 2"],
            "hints": ["Hint 1", "Hint 2"],
            "concepts": ["Keyword 1", "Keyword 2"]
        }}"""

        try:
            if not self.api_key:
                return self._get_mock_challenge(skill, proficiency)

            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 1000,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data['content'][0]['text']
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
            
            return self._get_mock_challenge(skill, proficiency)
        except Exception as e:
            print(f"AI Challenge Generation Error: {e}")
            return self._get_mock_challenge(skill, proficiency)

    def evaluate_submission(self, challenge_title, code):
        """Evaluate the user's code submission using AI"""
        prompt = f"""Evaluate the following code submission for the challenge '{challenge_title}':
        
        Code:
        \"\"\"
        {code}
        \"\"\"
        
        Provide feedback and a score.
        Respond ONLY in valid JSON format with:
        {{
            "score": 0-100,
            "feedback": "Detailed feedback on what was good and what can be improved",
            "passed": true/false,
            "suggested_fix": "Optional corrected code snippet"
        }}"""

        try:
            if not self.api_key:
                return self._evaluate_mock_submission(challenge_title, code)

            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 800,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data['content'][0]['text']
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())

            return {"score": 0, "feedback": "Evaluation failed. Please try again.", "passed": False}
        except Exception as e:
            print(f"AI Evaluation Error: {e}")
            return {"error": str(e)}

    def get_hint(self, challenge_title, code):
        """Get AI-driven hint based on current progress"""
        prompt = f"""The user is struggling with the coding challenge '{challenge_title}'.
        Current Code:
        {code}
        
        Provide a helpful hint that guides them towards the solution without giving it away directly.
        Respond ONLY in valid JSON format with:
        {{
            "hint": "The hint text here"
        }}"""

        try:
            if not self.api_key:
                return {"hint": "Try breaking the problem into smaller steps. Check your loops and conditions."}

            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 500,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data['content'][0]['text']
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())

            return {"hint": "Keep trying! Look at the key concepts listed."}
        except Exception as e:
            return {"hint": "Think about the edge cases."}

    def _evaluate_mock_submission(self, challenge_title, code):
        """Perform a basic local evaluation for mock challenges"""
        if not code or len(code.strip()) < 5:
            return {"score": 0, "feedback": "Code submission is too short or empty.", "passed": False}

        # 1. Syntax Check (Basic Python check)
        try:
            # We only do syntax check for python challenges in mock mode
            if "python" in challenge_title.lower() or "list" in challenge_title.lower():
                ast.parse(code)
        except SyntaxError as e:
            return {"score": 20, "feedback": f"Syntax Error: {str(e)}", "passed": False}
        except Exception:
            pass # Skip syntax check for non-python code in mock

        # 2. Key Concept Matching for mocks
        score = 60
        feedback = "Code has been submitted. "
        
        if "List Comprehension Master" in challenge_title:
            if "[" in code and "for" in code and "if" in code and "2" in code:
                score = 95
                feedback += "Great use of list comprehension and filtering! You've correctly implemented the even squares logic."
            elif "[" in code and "for" in code:
                score = 75
                feedback += "Correct use of list comprehension format, but check if you've included all the logic (squares and even filter)."
            else:
                score = 40
                feedback += "Please use a list comprehension as requested by the challenge."
        
        elif "Custom Hook Creation" in challenge_title:
            if "useState" in code and ("toggle" in code.lower() or "set" in code.lower()):
                score = 90
                feedback += "Correct hook implementation structure with state management."
            else:
                score = 50
                feedback += "Ensure you're using useState and providing a way to toggle the value."
        
        elif "AI Activation Function" in challenge_title:
            if "max(0" in code or ("0" in code and "if" in code and "else" in code):
                score = 95
                feedback += "Excellent! You've correctly implemented the ReLU activation function logic."
            else:
                score = 30
                feedback += "The ReLU function should return x if x > 0, otherwise 0. Hint: use max(0, x)."
        
        elif "SQL Join Master" in challenge_title:
            if "JOIN" in code.upper() and ("ON" in code.upper() or "USING" in code.upper()):
                score = 90
                feedback += "Correct use of JOIN syntax to combine tables."
            else:
                score = 40
                feedback += "Please use a JOIN clause to combine the users and orders tables."

        elif "AWS IAM Policy" in challenge_title:
            if "Effect" in code and "Action" in code and "Resource" in code:
                score = 95
                feedback += "Well-structured IAM policy! You've included the core Statement elements."
            else:
                score = 30
                feedback += "A valid IAM policy statement needs 'Effect', 'Action', and 'Resource' keys."

        elif "Python Decorator" in challenge_title:
            if "@" in code and "wrapper" in code and "func(" in code:
                score = 90
                feedback += "Great implementation of a basic function decorator!"
            else:
                score = 40
                feedback += "Remember the decorator pattern: a function that returns a wrapper around the original function."

        else:
            # Generic feedback for other challenges
            score = 70
            feedback += "The solution has been received and basic checks passed. (Simulated Evaluation)"

        return {
            "score": score,
            "feedback": feedback,
            "passed": score >= 70,
            "simulated": True
        }

    def _get_mock_challenge(self, skill, proficiency):
        """Fallback mock challenges if AI is unavailable"""
        mocks = {
            'python': {
                'title': 'List Comprehension Master',
                'description': 'Create a list of squares for all even numbers from 1 to 20 using a list comprehension.',
                'starter_code': "def get_even_squares():\n    # Your code here\n    pass",
                'test_cases': ['Result should contain [4, 16, 36, 64, 100, 144, 196, 256, 324, 400]'],
                'hints': ['Use the % operator to check for evenness', 'Syntax: [expr for item in list if condition]'],
                'concepts': ['List Comprehensions', 'Filtering']
            },
            'react': {
                'title': 'Custom Hook Creation',
                'description': 'Write a custom hook `useToggle` that returns a boolean value and a function to toggle it.',
                'starter_code': "import { useState } from 'react';\n\nexport function useToggle(initialValue = false) {\n    // Implement here\n}",
                'test_cases': ['Should return [value, toggleFunction]'],
                'hints': ['Use useState for the internal state', 'The toggle function should call the state setter'],
                'concepts': ['Hooks', 'State Management']
            },
            'ai': {
                'title': 'AI Activation Function',
                'description': 'Implement the ReLU (Rectified Linear Unit) activation function. It should return the input if it is positive, and 0 otherwise.',
                'starter_code': "def relu(x):\n    # Implement ReLU here\n    pass",
                'test_cases': ['relu(5) == 5', 'relu(-3) == 0'],
                'hints': ['Use the built-in max() function', 'ReLU is defined as max(0, x)'],
                'concepts': ['Neural Networks', 'Activation Functions']
            },
            'sql': {
                'title': 'SQL Join Master',
                'description': 'Write a query to join the `users` and `orders` tables on `user_id` to get all order details along with the user names.',
                'starter_code': "SELECT \n-- Add your columns and JOIN here\nFROM users",
                'test_cases': ['Should include JOIN users ON users.id = orders.user_id'],
                'hints': ['Use INNER JOIN or LEFT JOIN', 'The join condition goes after ON'],
                'concepts': ['SQL', 'Joins', 'Data Relationships']
            },
            'aws': {
                'title': 'AWS IAM Policy',
                'description': 'Create a simple JSON policy statement that allows "s3:GetObject" action on the resource "arn:aws:s3:::my-bucket/*".',
                'starter_code': "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": \"s3:GetObject\",\n      \"Resource\": \"arn:aws:s3:::my-bucket/*\"\n    }\n  ]\n}",
                'test_cases': ['JSON should be valid', 'Effect must be Allow'],
                'hints': ['IAM policies are JSON objects', 'Each statement needs Effect, Action, and Resource'],
                'concepts': ['AWS', 'Security', 'IAM']
            },
            'python_adv': {
                'title': 'Python Decorator',
                'description': 'Write a decorator function `debug` that prints "Calling function" before calling the decorated function.',
                'starter_code': "def debug(func):\n    def wrapper(*args, **kwargs):\n        # Add print here\n        return func(*args, **kwargs)\n    return wrapper",
                'test_cases': ['@debug should print output'],
                'hints': ['Decorators use the @ syntax', 'The wrapper function should call the original function'],
                'concepts': ['Python', 'Functional Programming', 'Decorators']
            }
        }
        return mocks.get(skill.lower(), {
            'title': f'Mastering {skill}',
            'description': f'Explain and implement a core concept in {skill} with a practical example.',
            'starter_code': f"# Practical {skill} implementation\n",
            'test_cases': ['Code should be syntactically correct'],
            'hints': ['Think about common interview questions for this skill'],
            'concepts': [skill, 'Best Practices']
        })

if __name__ == "__main__":
    # Test script for AILabEngine
    print("=== AI Lab Engine Verification ===")
    engine = AILabEngine()
    
    # 1. Test Challenge Generation
    python_challenge = engine.generate_challenge('python', 'intermediate')
    title = python_challenge.get('title')
    print(f"Challenge: {title}")
    
    # 2a. Correct Solution
    sample_code = "def get_even_squares(): return [i**2 for i in range(1, 21) if i % 2 == 0]"
    result1 = engine.evaluate_submission(title, sample_code)
    print(f"Correct Sol: Score={result1.get('score')}, Passed={result1.get('passed')}")
    
    # 2b. Syntax Error
    bad_code = "def oops(:"
    result2 = engine.evaluate_submission(title, bad_code)
    print(f"Syntax Error: Score={result2.get('score')}, Passed={result2.get('passed')}")

    # 2c. Missing Logic
    missing_logic = "def squares(): return [i for i in range(10)]"
    result3 = engine.evaluate_submission(title, missing_logic)
    print(f"Missing Logic: Score={result3.get('score')}, Passed={result3.get('passed')}")

    # 3. Test AI Challenge
    print("\n3. Testing AI Challenge...")
    ai_challenge = engine.generate_challenge('AI', 'intermediate')
    ai_title = ai_challenge.get('title')
    print(f"Challenge: {ai_title}")
    
    # 3a. Correct AI Sol
    ai_sol = "def relu(x): return max(0, x)"
    result4 = engine.evaluate_submission(ai_title, ai_sol)
    print(f"Correct AI: Score={result4.get('score')}, Passed={result4.get('passed')}")

    # 3b. Incorrect AI Sol
    ai_bad = "def relu(x): return x"
    result5 = engine.evaluate_submission(ai_title, ai_bad)
    print(f"Incorrect AI: Score={result5.get('score')}, Passed={result5.get('passed')}")
    
    print("=== Verification Complete ===")
