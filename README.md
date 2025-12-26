# Pathway 

Pathway is an AI-powered career growth and skill-bridge platform designed to help professionals navigate their career journey with personalized, data-driven insights. It combines real-time job market analysis with interactive learning experiences.

## Features

- **Personalized Career Pathfinding**: Get a tailored roadmap based on your target role and current skill set.
- **AI Skill Gap Analysis**: Visualizes your "Market Readiness" and identifies critical skills you need to master.
- **AI Skills Lab**: Hands-on coding challenges with real-time AI feedback and hints.
- **Pathway Assistant**: A persistent AI career coach powered by Google Gemini to answer your professional development questions.
- **Career Simulations**: Realistic, scenario-based evaluations (e.g., "SQL Performance Audit", "React Optimization") to test your problem-solving skills.
- **Interactive Gamification**: Earn XP and level up as you complete challenges and improve your readiness.
- **Automated Resume Analysis**: Instant ATS scoring and actionable feedback on your resume.

## Tech Stack

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context API

### Backend
- **Framework**: Flask
- **AI Integration**: Google Gemini API
- **Database**: MongoDB
- **Real-time Connectivity**: Flask-SocketIO
- **Evaluation Engine**: Scikit-learn (ML for job matching)
- **Deployment**: Configured for Render (Gunicorn + Unified Service)

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/laradharshini/Pathway.git
   cd Pathway
   ```

2. **Backend Configuration**
   - Navigate to the root.
   - Install dependencies: `pip install -r backend/requirements.txt`
   - Create a `.env` file in the root with:
     ```env
     JWT_SECRET_KEY=your_secret_key
     MONGO_URI=your_mongodb_uri
     GEMINI_API_KEY=your_gemini_api_key
     ```
   - Start the backend: `python backend/app.py`

3. **Frontend Configuration**
   - Navigate to `frontend-new/`.
   - Install dependencies: `npm install`
   - Start development server: `npm run dev`

## Deployment

This project is optimized for deployment on **Render**. It uses a unified service approach where the Flask backend serves the production-ready React frontend.

1. Build the frontend: `cd frontend-new && npm install && npm run build`
2. Start in production: `gunicorn --chdir backend app:app`

---
