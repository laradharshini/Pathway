
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class ChatService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        # ... (rest stays same)
        self.system_prompt = """
        You are 'Pathway Assistant', an expert career coach and technical mentor integrated into the Pathway app.
        Your goal is to help users find jobs, improve skills, and prepare for interviews.
        
        Capabilities:
        1. Analyze job descriptions and suggest skill gaps.
        2. Explain specific technical concepts (React, Python, AWS).
        3. Recommend simulations from the app catalog.
        
        Tone: Professional, encouraging, concise, and helpful. 
        Always keep responses fairly short (under 3 paragraphs) unless asked for a detailed explanation.
        """

    def generate_response(self, user_message, context=None):
        if not api_key:
            return "I'm sorry, my brain (API Key) is missing. Please check the system configuration."

        try:
            # Construct a prompt with context
            full_prompt = f"{self.system_prompt}\n\n"
            
            if context:
                full_prompt += f"User Context: {context}\n\n"
                
            full_prompt += f"User: {user_message}\nAssistant:"

            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            error_msg = str(e)
            print(f"Gemini Error: {error_msg}")
            
            # Specific handling for Rate Limits (Quota)
            if "429" in error_msg or "Quota" in error_msg:
                return "I've reached my daily limit for free AI requests! 🛑 Please try again in a little while, or check back tomorrow."
                
            return f"I'm having a bit of trouble connecting to my knowledge base (Error: {error_msg[:30]}...). Please try again later!"

# Singleton instance
chat_service = ChatService()
