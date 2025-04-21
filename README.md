graduation project

A modular backend application built with Node.js, TypeScript, and Express. This project follows best practices for modular architecture, authentication, file handling, and AI-powered analysis.

Features
Modular Architecture for scalability and maintainability
Authentication (User management)
File Upload & PDF Parsing (Multer & pdf-parse)
AI-powered Resume Analysis (Groq API for ATS scoring)
Error Handling & Validation (Custom error classes & middleware)
Project Structure
bash
Copy
Edit
/src
  /modules
    /auth
      - auth.controller.ts
      - auth.service.ts
      - auth.routes.ts
      - auth.dto.ts
    /users
      - user.controller.ts
      - user.service.ts
      - user.routes.ts
      - user.dto.ts
      - user.model.ts
    /file-upload
      - upload.service.ts
      - upload.middleware.ts
    /pdf
      - pdf.service.ts
    /ats-analysis
      - ats.service.ts
  /config
    - db.ts
  /middlewares
    - error.middleware.ts
    - auth.middleware.ts
  /utils
    - appError.ts
  /interfaces
    - authenticatedRequest.interface.ts
  - server.ts
Installation & Setup
Clone the repository

sh
Copy
Edit
git clone <repo-url>
cd <project-folder>
Install dependencies

sh
Copy
Edit
pnpm install
Set up environment variables
Create a .env file in the root directory:

ini
Copy
Edit
PORT=5000
DATABASE_URL=mongodb://localhost:27017/your-db
GROQ_API_KEY=your-groq-api-key
Run the application

sh
Copy
Edit
pnpm dev
Modules Overview
Authentication Module
Endpoints:

POST /auth/signup → Register a new user
POST /auth/login → User login
POST /auth/logout → Logout
POST /auth/forgot-password → Request password reset
POST /auth/reset-password → Reset password
Best Practices:

Passwords are hashed before saving.
JWT-based authentication.
Separation of concerns with AuthController and AuthService.
User Module
Endpoints:

GET /users/me → Get logged-in user
PATCH /users/me → Update logged-in user
DELETE /users/me → Delete own account
GET /users → Get all users (Admin only)
GET /users/:id → Get user by ID
PATCH /users/:id → Update user by ID
DELETE /users/:id → Delete user by ID
Best Practices:

DTOs (user.dto.ts) enforce strict data validation.
Separation of concerns via UserService.
AppError class for consistent error handling.
File Upload & PDF Processing
Endpoints:

POST /upload/pdf → Upload a PDF file
How it works:

Uses Multer to handle file uploads.
Validates that only PDFs are uploaded.
Extracts text using pdf-parse.
Best Practices:

Separate concerns: UploadService for handling storage, PDFService for extracting text.
Temporary files are cleaned up after processing.
AI-Powered Resume Analysis
Endpoints:

POST /ats/analyze → Analyze a resume file
How it works:

Extracts text from PDF.
Sends the text to Groq’s AI model for ATS scoring.
Returns a structured JSON response with:
json
Copy
Edit
{
  "overall": 85,
  "keywords": ["javascript", "react", "node.js"],
  "missing_keywords": ["docker", "kubernetes"],
  "format_score": 90
}
Best Practices:

AI API integration is abstracted into ATSAnalysisService.
Uses temperature: 0.3 for stable outputs.
Ensures JSON output consistency with structured prompts.
Error Handling & Logging
Global error handling middleware in /middlewares/error.middleware.ts
Consistent error response format using AppError
Logs errors for debugging
Future Improvements
Add unit tests with Jest
Implement role-based access control (RBAC)
Optimize database queries with indexing
