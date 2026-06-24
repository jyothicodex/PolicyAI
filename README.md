# PolicyAI

PolicyAI is an AI-powered policy document understanding platform. It allows organizations to upload their internal policy documents (like HR handbooks, IT policies, etc.) and allows employees to chat with an AI assistant that understands these documents. The AI can also perform actions on behalf of the user, such as drafting leave requests or submitting IT tickets.

## 🌟 Core Features
- **Local AI Engine**: Powered completely locally using Ollama (`llama3.2` for chat and tool calling, `nomic-embed-text` for vector embeddings).
- **Retrieval-Augmented Generation (RAG)**: Extracts text from uploaded PDFs and generates embeddings to accurately answer questions based on your specific documents.
- **Agentic AI Tool Calling**: The AI isn't just a chatbot; it can trigger backend functions (tools) like drafting leave requests or checking leave balances based on the conversation context.
- **Secure Authentication**: Built with Spring Security, utilizing stateless JWT (JSON Web Tokens) for sessions and TOTP (Time-Based One-Time Password) for 2FA via Google Authenticator.
- **Modern UI**: A responsive, glassmorphism-inspired UI built with React, Vite, and plain CSS with theming variables.

## 🏗️ Architecture
- **Frontend**: React.js, Vite, React Router DOM, Lucide Icons.
- **Backend**: Java 21, Spring Boot 3, Spring Security, Spring Data JPA.
- **Database**: H2 (File-based database, stored locally in `backend/data/`).
- **AI / LLM**: Ollama API running locally.

## 🚀 Getting Started

### Prerequisites
1. **Node.js** (v18+)
2. **Java 21** (JDK 21)
3. **Maven**
4. **Ollama**: Download from [ollama.com](https://ollama.com/)

### 1. Setup Ollama (AI Models)
Start Ollama and pull the required models:
```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```
*(Ensure Ollama is running in the background on port `11434`)*

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build the project using Maven:
   ```bash
   ./mvnw clean install
   # Or use the provided script on Windows: run.bat build
   ```
3. Start the Spring Boot server:
   ```bash
   ./mvnw spring-boot:run
   # Or use the provided script on Windows: run.bat
   ```
   The backend will run on `http://localhost:8080`.

### 3. Frontend Setup
1. Navigate to the root directory (where `package.json` is located).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

## 📁 Project Structure

- `/src`: React frontend source code.
  - `/components`: Reusable UI components (Sidebar, TopBar, etc.).
  - `/pages`: Main application views (Dashboard, Chat, Login, etc.).
  - `/contexts`: React Context providers (AuthContext, ChatContext).
  - `/services`: API service calls to the Spring Boot backend.
- `/backend`: Spring Boot Java application.
  - `/src/main/java/com/policyai`: Core Java source code.
    - `/controller`: REST API endpoints.
    - `/service`: Business logic (Chat routing, Ollama API, JWT Auth, PDF parsing).
    - `/repository`: Database access interfaces.
    - `/model` & `/dto`: JPA Entities and Data Transfer Objects.
    - `/config`: Spring Security and CORS configurations.
### 📂 Directory Architecture Flow

```mermaid
graph TD
    Root[PolicyAI Root] --> Frontend[📁 frontend / src]
    Root --> Backend[📁 backend / src/main/java/com/policyai]

    subgraph Frontend Architecture
        Frontend --> P[📁 pages]
        Frontend --> C[📁 components]
        Frontend --> S[📁 services]
        Frontend --> CX[📁 contexts]
        
        P -->|Renders| C
        P -->|Calls API Actions| S
        CX -->|Provides Global Auth/Chat State| P
    end

    subgraph Backend Architecture
        Backend --> Ctrl[📁 controller]
        Backend --> Svc[📁 service]
        Backend --> Repo[📁 repository]
        Backend --> Model[📁 model & dto]
        
        Svc -->|Orchestrates RAG & Ollama API| LocalAI[🤖 Local LLM Engine]
        Ctrl -->|Routes Request| Svc
        Svc -->|Fetches/Persists Data| Repo
        Repo -->|Maps Entities| Model
        Repo -->|Reads/Writes| H2[(H2 Database)]
    end

    S -->|Secure HTTP Requests + JWT| Ctrl

    style Frontend Architecture fill:#eff6ff,stroke:#3b82f6,stroke-width:2px
    style Backend Architecture fill:#f0fdf4,stroke:#22c55e,stroke-width:2px

## 🤝 Contributing

1. **Fork & Clone:** Fork the repository and clone it.
2. **Branch:** Create a feature branch: `git checkout -b feature/your-feature`.
3. **Commit:** Save your changes: `git commit -m "feat: short description"`.
4. **Push & PR:** Push to your branch and open a Pull Request.
