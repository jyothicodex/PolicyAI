# PolicyAI

> An AI-powered policy document assistant. Upload your company's PDF policies and instantly chat with them — powered by Google Gemini 2.5 Flash.

**Live Demo:** [policyai-wine.vercel.app](https://policyai-wine.vercel.app) &nbsp;|&nbsp; **Backend API:** [policyai-6y07.onrender.com](https://policyai-6y07.onrender.com)

---

## ✨ Features

- **AI Chat over Documents** — Ask natural language questions about any uploaded policy PDF and get precise, sourced answers using RAG (Retrieval-Augmented Generation).
- **Streaming Responses** — Answers stream token-by-token for a fast, ChatGPT-like experience.
- **Agentic Tool Calling** — The AI can go beyond answering questions and trigger backend actions (e.g., drafting leave requests, checking balances).
- **PDF Upload & Summarization** — Upload policy documents and get an automatic AI-generated summary with key points and sections.
- **Secure Authentication** — Stateless JWT sessions + TOTP-based Two-Factor Authentication (2FA) via Google Authenticator.
- **Dark / Light Mode** — Fully-themed UI with instant switching.
- **Email Notifications** — Password reset and account-related emails via SMTP.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, React Router DOM, Lucide Icons |
| **Backend** | Java 21, Spring Boot 3, Spring Security, Spring Data JPA |
| **Database** | H2 (local dev) / PostgreSQL (production) |
| **AI Engine** | Google Gemini 2.5 Flash (chat + streaming) |
| **Embeddings** | Google `gemini-embedding-2` model |
| **Deployment** | Frontend → Vercel · Backend → Render |

---

## 🚀 Local Development

### Prerequisites

- **Node.js** v18+
- **Java 21** (JDK)
- **Maven** (or use the bundled `run.bat` wrapper on Windows)
- **A Gemini API key** — Get one free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/policydoc.git
cd policydoc
```

---

### 2. Backend Setup

```bash
cd backend
```

Set your Gemini API key as an environment variable:

```powershell
# PowerShell
$env:GEMINI_API_KEY="your_api_key_here"
```
```bash
# bash / zsh
export GEMINI_API_KEY="your_api_key_here"
```

Start the Spring Boot server (Windows):
```bash
run.bat
```

Or with Maven directly:
```bash
mvn spring-boot:run
```

The backend starts at **`http://localhost:8080`**.

> **Default admin credentials** (created on first run if no users exist):
> - Email: `venisha@policyai.com`
> - Password: `PolicyAI@2026`
> 
> Change these in `application.properties` before deploying.

---

### 3. Frontend Setup

```bash
# From the repo root
npm install
npm run dev
```

The frontend starts at **`http://localhost:5173`**.

---

## 📁 Project Structure

```
policydoc/
├── backend/                          # Spring Boot 3 API (Java 21)
│   ├── src/main/java/com/policyai/
│   │   ├── config/                   # Security, CORS, filter chains
│   │   ├── controller/               # REST endpoints
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── model/                    # JPA Entities
│   │   ├── repository/               # Spring Data JPA interfaces
│   │   └── service/
│   │       ├── GeminiService.java    # Gemini API integration (chat + embeddings)
│   │       ├── ChatService.java      # RAG pipeline + streaming
│   │       ├── DocumentService.java  # PDF processing + async embedding
│   │       ├── VectorStoreService.java  # In-memory cosine similarity search
│   │       ├── AgentActionService.java  # Agentic tool implementations
│   │       ├── JwtService.java       # JWT issuance & validation
│   │       ├── TotpService.java      # TOTP / 2FA logic
│   │       └── EmailService.java     # SMTP email delivery
│   ├── src/main/resources/
│   │   ├── application.properties       # Local dev config
│   │   └── application-prod.properties  # Production config (env vars)
│   ├── Dockerfile                    # Multi-stage build for Render
│   └── pom.xml
│
└── src/                              # React + Vite Frontend
    ├── components/                   # Reusable UI components
    ├── contexts/                     # Auth, Chat, Theme context providers
    ├── pages/                        # Route-level views
    ├── services/api.js               # Axios API wrappers
    └── utils/helpers.js              # Shared utilities
```

---

## ☁️ Production Deployment

### Backend — Render

The backend is containerized via `backend/Dockerfile` and deployed on **Render** as a Web Service.

Set the following environment variables in your Render dashboard:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `DATABASE_URL` | PostgreSQL connection string (e.g., from Render Postgres) |
| `DATABASE_USERNAME` | DB username |
| `DATABASE_PASSWORD` | DB password |
| `JWT_SECRET` | A long random string for signing JWTs |
| `SPRING_PROFILES_ACTIVE` | Set to `prod` |

### Frontend — Vercel

The frontend is deployed on **Vercel** (auto-detected as a Vite project).

Set the following environment variable in your Vercel project settings:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Your Render backend URL, e.g. `https://your-app.onrender.com/api` |

---

## 🔒 Security Notes

- **Never commit your API keys.** The `GEMINI_API_KEY` is loaded from environment variables — the key is never stored in source code.
- The root `.gitignore` excludes all `.env*` files.
- JWT secrets should be at least 64 characters of random hex for production.
- TOTP 2FA is available for all accounts and is enforced after enabling in the profile page.

---

## 🤝 Contributing

1. **Fork & Clone** the repository.
2. **Branch** from `main`: `git checkout -b feature/your-feature`
3. **Commit** with a clear message: `git commit -m "feat: short description"`
4. **Push** and open a Pull Request.
