# Pathway 🚀

Pathway is an AI-powered career growth and skill-bridge platform designed to help professionals navigate their career journey with personalized, data-driven insights. It combines real-time job market analysis with interactive learning experiences.

---

## 🌟 Features

- **Personalized Career Pathfinding**: Get a tailored roadmap based on your target role and current skill set.
- **AI Skill Gap Analysis**: Visualizes your "Market Readiness" and identifies critical skills you need to master.
- **AI Skills Lab**: Hands-on coding challenges with real-time AI feedback and hints.
- **Pathway Assistant**: A persistent AI career coach powered by Google Gemini to answer your professional development questions.
- **Career Simulations**: Realistic, scenario-based evaluations (e.g., "SQL Performance Audit", "React Optimization") to test your problem-solving skills.
- **Interactive Gamification**: Earn XP and level up as you complete challenges and improve your readiness.
- **Automated Resume Analysis**: Instant ATS scoring and actionable feedback on your resume.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API

### Backend
- **Framework**: [Flask](https://flask.palletsprojects.com/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Real-time Connectivity**: [Flask-SocketIO](https://flask-socketio.readthedocs.io/)
- **Evaluation Engine**: Scikit-learn (ML for job matching)
- **Deployment**: [Render](https://render.com/) (Gunicorn + Unified Service)

---

## 📂 Project Structure

```text
Pathway/
├── backend/                # Flask Backend
│   ├── app.py              # Main Application Entry
│   ├── requirements.txt    # Python Dependencies
│   └── admin_profile.py    # Admin Profile Logic
├── frontend/               # React Frontend (New)
│   ├── src/                # Component & Logic Source
│   ├── public/             # Static Assets
│   └── package.json        # Frontend Dependencies
├── frontend_legacy/        # Legacy Styles and Assets
├── dashboard.html          # Legacy Dashboard View
└── README.md               # You are here!
```

---

## 🚀 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/laradharshini/Pathway.git
cd Pathway
```

### 2. Backend Configuration
1. Navigate to the root.
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Create a `.env` file in the root with:
   ```env
   JWT_SECRET_KEY=your_secret_key
   MONGO_URI=your_mongodb_uri
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend:
   ```bash
   python backend/app.py
   ```

### 3. Frontend Configuration
1. Navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment

This project is optimized for deployment on **Render**. It uses a unified service approach where the Flask backend serves the production-ready React frontend.

1. **Build the frontend**: 
   ```bash
   cd frontend && npm install && npm run build
   ```
2. **Start in production**: 
   ```bash
   gunicorn --chdir backend app:app
   ```

---
Made with ❤️ by [Lara Dharshini](https://github.com/laradharshini)
