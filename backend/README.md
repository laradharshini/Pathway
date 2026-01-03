# 🧠 Pathway Backend: Intelligence Layer

The Pathway backend is a high-performance Flask API that orchestrates various AI and ML models to power career pathfinding.

## 🛠 Technology Stack
- **Framework**: Flask (with CORS, JWT, and Socket.IO)
- **Database**: MongoDB Atlas (NoSQL storage)
- **AI Engines**: 
  - **Google Gemini**: Powers the Pathway Chat Assistant.
  - **Anthropic Claude**: Generates Skills Lab challenges and analyzes resumes.
- **ML Layer**: Scikit-Learn utilizing TF-IDF Vectorization for career matching.
- **Async Tasks**: APScheduler for background job syncing.

## 📁 Key Modules
- `app.py`: Main gateway and API orchestration.
- `matcher.py`: The "Brain" of the project—calculates skill gaps and readiness scores.
- `ai_lab.py`: Dynamic challenge generation and scoring.
- `simulation_engine.py`: Scenario-based evaluation logic.
- `data_engine.py`: Handles massive job datasets from The Muse and MongoDB.

## 🔒 Security
- **JWT Authentication**: Secure user sessions.
- **Firebase Admin SDK**: Server-side token validation for OAuth.
- **Environment Variables**: Managed via `python-dotenv`.

---
*Created for the Pathway Career Platform*
