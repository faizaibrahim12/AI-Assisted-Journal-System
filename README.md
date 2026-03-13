# AI-Assisted Journal System

A full-stack journaling application with AI-powered emotion analysis using LLM.

## 🌟 Features

- **Journal Entry Management** - Create and view journal entries with ambience tags
- **AI Emotion Analysis** - Analyze text for emotions, keywords, and summaries using LLM
- **Insights Dashboard** - View mental state trends over time
- **Beautiful UI** - Modern, animated interface with dark theme

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- SQLite (local database)
- Groq API (LLM)

### Frontend
- Next.js 16 (App Router)
- React 18
- Tailwind CSS v4
- Axios

## 📋 Prerequisites

- Node.js 18+
- Groq API key (free at https://console.groq.com)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ai-journal-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

SQLite database will be created automatically.

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## 🏃 Running the Application

### Start Backend
```bash
cd backend
npm run start
```
Server runs on: http://localhost:5000

### Start Frontend
```bash
cd frontend
npm run dev
```
App runs on: http://localhost:3000

## 📡 API Endpoints

### 1. Create Journal Entry
```http
POST /api/journal
```
```json
{
  "userId": "123",
  "ambience": "forest",
  "text": "I felt calm today after listening to the rain."
}
```

### 2. Get User Entries
```http
GET /api/journal/:userId
```

### 3. Analyze Text (LLM)
```http
POST /api/journal/analyze
```
```json
{
  "text": "I felt calm today after listening to the rain"
}
```

### 4. Get User Insights
```http
GET /api/journal/insights/:userId
```

## 📁 Project Structure

```
ai-journal-system/
├── backend/
│   ├── server.js          # Express server
│   ├── models/
│   │   └── Journal.js     # MongoDB schema
│   ├── routes/
│   │   └── journal.js     # API routes
│   ├── services/
│   │   └── llm.js         # Groq LLM integration
│   └── .env               # Environment variables
└── frontend/
    ├── src/app/
    │   ├── page.tsx       # Main UI component
    │   ├── layout.tsx     # App layout
    │   └── globals.css    # Global styles
    └── package.json
```

## 🎯 Usage

1. Open http://localhost:3000
2. Write your journal entry
3. Select an ambience (Forest, Ocean, Mountain, etc.)
4. Click "Save Entry" to store
5. Click "Analyze" for AI emotion analysis
6. Click "Insights" to view your mental health trends

## 📝 License

MIT
"# AI-Assisted-Journal-System" 
