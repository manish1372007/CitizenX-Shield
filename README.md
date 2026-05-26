🛡️ CitizenX Shield
AI-Powered Cyber Fraud Detection & Citizen Protection Platform
<p align="center"> <img src="https://img.shields.io/badge/AI-CyberSecurity-blue?style=for-the-badge" /> <img src="https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react" /> <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" /> <img src="https://img.shields.io/badge/OCR-Tesseract-orange?style=for-the-badge" /> <img src="https://img.shields.io/badge/AI-Gemini-red?style=for-the-badge" /> </p>
🚀 Overview

CitizenX Shield is an advanced AI-powered cyber fraud detection platform designed to protect citizens from modern digital scams and cyber threats.

The platform combines:

🤖 Artificial Intelligence
🧠 Threat Intelligence
📸 OCR-based Screenshot Analysis
📊 Real-Time Fraud Analytics
🔗 Scam Relationship Mapping
🎙️ AI Voice Assistance
🛡️ Cyber Safety Guidance

into one unified cyber defense ecosystem.

🎯 Problem Statement

Cyber frauds are rapidly increasing through:

Fake UPI requests
OTP scams
Loan frauds
Phishing attacks
Deepfake impersonation
AI-generated scam content
Fake customer care scams

Most citizens cannot identify sophisticated scams quickly enough.

CitizenX Shield solves this problem using AI-powered real-time detection and intelligent cyber safety assistance.

💡 Key Features
🔍 AI Scam Detection

Detects:

Phishing links
Fake banking messages
OTP theft scams
KYC frauds
UPI payment scams
Investment scams
Fake customer support scams
📸 OCR Screenshot Detection

Users can upload screenshots of suspicious messages.

The OCR engine:

Extracts hidden text
Sends text to AI engine
Detects scam patterns
Generates risk score
🧠 Threat Intelligence Mapping

The platform connects:

Phone numbers
URLs
Scam campaigns
Repeated fraud patterns

to identify organized scam networks.

🎙️ SIA Voice Assistant

AI voice assistant for:

Scam guidance
Voice interaction
Cyber safety recommendations
User support
📊 Real-Time Analytics Dashboard

Displays:

Total complaints
Financial losses
Active scam categories
Threat trends
Fraud growth analytics
🧾 Fraud Reporting System

Citizens can officially report:

Scam numbers
Fraud incidents
Financial losses
Suspicious activities
🧬 AI-Generated Content Detection

Detects suspicious:

AI-generated scam text
Synthetic phishing messages
Manipulated content patterns
🏗️ System Architecture
User Input
   ↓
Frontend (React + TypeScript)
   ↓
OCR Engine (Tesseract.js)
   ↓
Backend API (Node.js + Express)
   ↓
AI Analysis Engine (Gemini API)
   ↓
Risk Scoring & Threat Intelligence
   ↓
Dashboard + Alerts + Recommendations

⚙️ Tech Stack
Frontend
React
TypeScript
TailwindCSS
Vite
Lucide React
Backend
Node.js
Express.js
TypeScript
AI & Intelligence
Google Gemini API
Rule-Based Threat Engine
OCR
Tesseract.js
Storage
JSON Collection Database

🧠 How Scam Detection Works
1. User uploads message or screenshot
        ↓
2. OCR extracts text
        ↓
3. Text preprocessing starts
        ↓
4. AI analyzes scam indicators
        ↓
5. Threat score generated
        ↓
6. Scam classification returned
        ↓
7. Safety recommendation shown

🔬 AI Detection Logic

The AI checks for:

Fake urgency
Emotional manipulation
Financial pressure
Suspicious URLs
Impersonation attempts
Threat language
Scam keywords
UPI fraud patterns
🛡️ Hybrid AI Architecture

CitizenX Shield uses:

Primary AI

Google Gemini API

Backup Engine

Local rule-based scam detection

Why?

If cloud AI fails:

Internet issue
API quota exceeded
Server downtime

the local engine still keeps protection active.

📂 Project Structure
CitizenX-Shield/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── assets/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── database/
│   └── middleware/
│
├── ai-engine/
├── ocr-engine/
├── analytics/
└── docs/
🔐 Security Features
Input validation
Secure session handling
AI safety filtering
Scam threshold verification
Malicious payload prevention
📈 Future Enhancements
Deepfake face detection
Voice fraud detection
WhatsApp scam analysis
Real-time call monitoring
Government cybercrime integration
Blockchain fraud tracking
🌍 Real-World Impact

CitizenX Shield can help:

Citizens
Banks
Colleges
Cybercrime departments
Government agencies
Financial institutions

by reducing cyber fraud risks through intelligent automation.

🚀 Installation
Clone Repository
git clone 
Install Frontend
cd frontend
npm install
npm run dev
Install Backend
cd backend
npm install
npm run dev
🔑 Environment Variables

Create .env file:

ADD_API_KEY=your_api_key
PORT=5000
🧪 Example Scam Detection Output
{
  "riskLevel": "SCAM",
  "riskScore": 92,
  "scamType": "UPI Fraud",
  "recommendation": "Do not click links or share OTP."
}
📊 Why CitizenX Shield is Unique

✅ OCR-Based Scam Detection
✅ Hybrid AI Architecture
✅ Threat Intelligence Mapping
✅ Real-Time Fraud Analytics
✅ AI Voice Assistant
✅ Cyber Safety Ecosystem
✅ Scalable Cloud Architecture

🏆 Innovation Highlights
AI + OCR integration
Intelligent fraud relationship graphing
Real-time cyber threat analytics
Screenshot-based scam detection
Multi-layer threat analysis
👨‍💻 Contributors

Developed with innovation and cybersecurity vision to build a safer digital ecosystem.

📜 License

This project is just for education purpose 

⭐ Support

If you like this project:

⭐ Star the repository
🍴 Fork the project
🛡️ Spread cyber awareness

🧠 Final Note

CitizenX Shield is not just a scam detector.

It is a next-generation AI cyber defense ecosystem designed to protect citizens against evolving digital fraud threats using intelligent automation, OCR, AI reasoning, and cyber threat intelligence.

CitizenX Shield – Accurate System Architecture
Overview
CitizenX Shield is an AI-powered cyber safety and fraud prevention platform built using:
•	Frontend: React + TypeScript + Vite
•	Backend: Node.js + Express
•	AI Engine: Google Gemini API (@google/genai)
•	OCR Engine: Tesseract.js
•	Storage: Local JSON-based collections
•	Styling/UI: TailwindCSS + Lucide Icons + Motion
The application provides:
1.	Scam Detection
2.	Fraud Reporting
3.	Deepfake Detection
4.	Aadhaar Verification
5.	AI Assistant (SIA)
6.	Threat Intelligence Dashboard
7.	Alert Monitoring
8.	Verification History
________________________________________
1. Complete High-Level Architecture
┌─────────────────────────────────────────────┐
│                 USER DEVICE                 │
│  Mobile / Laptop / Browser                  │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│            REACT FRONTEND (VITE)            │
│---------------------------------------------│
│ DashboardView                               │
│ ScamDetectorView                            │
│ DeepfakeDetectorView                        │
│ ReportFraudView                             │
│ VerifyAadhaarView                           │
│ AlertsView                                  │
│ VerificationHistoryView                     │
│ SiaVoiceAssistant                           │
│ SiaIntelligenceDashboardView                │
└─────────────────────────────────────────────┘
                     │
             REST API Calls
                     │
                     ▼
┌─────────────────────────────────────────────┐
│           EXPRESS BACKEND SERVER            │
│---------------------------------------------│
│ Authentication Engine                       │
│ Scam Detection Engine                       │
│ Deepfake Analysis Engine                    │
│ OCR Processing Engine                       │
│ Aadhaar Verification Engine                 │
│ SIA AI Assistant Engine                     │
│ Intelligence Correlation Engine             │
│ Alert Generation Engine                     │
└─────────────────────────────────────────────┘
                     │
      ┌──────────────┴──────────────┐
      │                             │
      ▼                             ▼
┌───────────────┐        ┌──────────────────┐
│ Gemini AI API │        │ Tesseract OCR    │
│ Google GenAI  │        │ Text Extraction  │
└───────────────┘        └──────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│          JSON COLLECTION DATABASE           │
│---------------------------------------------│
│ users.json                                  │
│ reports.json                                │
│ verifications.json                          │
│ deepfakes.json                              │
│ complaints.json                             │
│ entities.json                               │
│ connections.json                            │
│ user_risk_events.json                       │
└─────────────────────────────────────────────┘
________________________________________
2. Frontend Architecture
The frontend is built using React with component-based architecture.
Main Application Controller
File:
src/App.tsx
This file:
•	Controls authentication state
•	Handles session management
•	Manages navigation tabs
•	Loads all modules dynamically
•	Maintains user session in localStorage
________________________________________
Frontend Component Structure
App.tsx
│
├── AuthView
├── DashboardView
├── ScamDetectorView
├── ReportFraudView
├── VerifyAadhaarView
├── DeepfakeDetectorView
├── AlertsView
├── VerificationHistoryView
├── SiaVoiceAssistant
├── SiaChatBubble
└── SiaIntelligenceDashboardView
________________________________________
3. Backend Architecture
Backend file:
server.ts
The backend is a centralized Express server handling all APIs.
Backend Responsibilities
Authentication
•	User login
•	User registration
•	Session generation
•	Local session restoration
AI Processing
•	Scam message analysis
•	Deepfake detection
•	AI chatbot processing
•	Risk classification
Data Management
•	Save reports
•	Save verifications
•	Save deepfake analyses
•	Maintain intelligence graph
OCR Processing
•	Extract text from uploaded screenshots/documents
•	Send extracted text to AI engine
________________________________________
4. Database Architecture
CitizenX Shield uses a lightweight embedded JSON collection system.
Collection Class
Inside server.ts, a reusable Collection<T> class acts like a mini database.
Features:
•	Read JSON files
•	Write JSON files
•	Insert records
•	Filter records
•	Auto-create storage folders
________________________________________
Database Collections
Users Collection
users.json
Stores:
•	User ID
•	Name
•	Email
•	Mobile number
•	Session data
________________________________________
Reports Collection
reports.json
Stores:
•	Scam reports
•	Fraud descriptions
•	Scam phone numbers
•	URLs
•	Report timestamps
________________________________________
Verifications Collection
verifications.json
Stores:
•	Aadhaar verification logs
•	Validation results
•	Risk scores
________________________________________
Deepfakes Collection
deepfakes.json
Stores:
•	Uploaded media analysis
•	AI detection confidence
•	Manipulation indicators
________________________________________
Intelligence Collections
entities.json
connections.json
user_risk_events.json
Used for:
•	Threat graph building
•	Scam network mapping
•	Relationship analysis
•	Risk event tracking
________________________________________
5. Scam Detection Architecture
Objective
Detect scam messages, suspicious URLs, fake KYC requests, and phishing attempts.
________________________________________
Scam Detection Flow
USER ENTERS MESSAGE / UPLOADS SCREENSHOT
                 │
                 ▼
      OCR ENGINE (Tesseract.js)
     Extract text from image
                 │
                 ▼
      TEXT NORMALIZATION ENGINE
     Clean & preprocess message
                 │
                 ▼
        GEMINI AI ANALYSIS
                 │
                 ▼
      FRAUD CLASSIFICATION ENGINE
                 │
 ┌───────────────┼────────────────┐
 ▼               ▼                ▼
Phishing      Fake KYC       UPI Fraud
Lottery Scam  Deepfake Call  Impersonation
                 │
                 ▼
         RISK SCORE GENERATION
                 │
                 ▼
       USER ALERT + RECOMMENDATION
________________________________________
Detection Logic
The system checks for:
•	Suspicious URLs
•	Urgent payment language
•	Fake KYC warnings
•	OTP requests
•	Threatening language
•	Impersonation attempts
•	Fraud keywords
•	Banking scam patterns
If Gemini quota fails:
Fallback Local Rules Engine
automatically takes over.
________________________________________
6. Deepfake Detection Architecture
Purpose
Analyze uploaded media and determine if it is AI-generated or manipulated.
________________________________________
Deepfake Detection Flow
UPLOAD IMAGE / VIDEO / AUDIO
              │
              ▼
      MEDIA PREPROCESSING
              │
              ▼
      AI ANALYSIS PIPELINE
              │
              ▼
    FACE / VOICE INCONSISTENCY CHECK
              │
              ▼
    GEMINI AI RISK EVALUATION
              │
              ▼
    CONFIDENCE SCORE GENERATION
              │
              ▼
   FINAL RESULT TO USER DASHBOARD
________________________________________
Parameters Checked
•	Facial distortions
•	Lip-sync mismatch
•	Artificial blinking
•	Audio waveform mismatch
•	Synthetic voice patterns
•	Metadata inconsistencies
•	Compression artifacts
________________________________________
7. Aadhaar Verification Architecture
Purpose
Verify Aadhaar authenticity and reduce identity fraud.
________________________________________
Verification Flow
USER ENTERS AADHAAR DATA
            │
            ▼
     FORMAT VALIDATION
            │
            ▼
     OCR / NUMBER EXTRACTION
            │
            ▼
   AI-BASED FRAUD ANALYSIS
            │
            ▼
  RISK SCORE + VALIDATION STATUS
            │
            ▼
 SAVE RESULT IN VERIFICATION LOG
________________________________________
8. SIA AI Assistant Architecture
SIA = Smart Intelligence Assistant
Purpose:
•	Guide users during scams
•	Answer fraud-related questions
•	Recommend safe actions
•	Help victims respond intelligently
________________________________________
SIA Architecture
USER QUESTION
      │
      ▼
VOICE/TEXT INPUT HANDLER
      │
      ▼
 NATURAL LANGUAGE PROCESSING
      │
      ▼
 GEMINI AI RESPONSE ENGINE
      │
      ▼
 SAFETY FILTER LAYER
      │
      ▼
 FINAL RESPONSE TO USER
________________________________________
Capabilities
•	Scam awareness guidance
•	Emergency advice
•	Fraud prevention tips
•	Real-time response suggestions
•	Cyber safety education
________________________________________
9. SIA Intelligence Dashboard Architecture
Purpose
Build connections between fraud reports to identify scam networks.
________________________________________
Intelligence Engine Flow
NEW FRAUD REPORT
        │
        ▼
 ENTITY EXTRACTION ENGINE
        │
        ├── Phone Numbers
        ├── URLs
        ├── Emails
        ├── Wallet IDs
        └── User IDs
                │
                ▼
       CONNECTION MAPPING ENGINE
                │
                ▼
       THREAT GRAPH GENERATION
                │
                ▼
    RISK RELATIONSHIP VISUALIZATION
________________________________________
Intelligence Features
•	Scam pattern correlation
•	Shared scam number detection
•	Fraud cluster analysis
•	Connected attack tracing
•	Repeat offender identification
________________________________________
10. Authentication Architecture
Authentication Flow
USER LOGIN / REGISTER
          │
          ▼
   EXPRESS AUTH API
          │
          ▼
 USER RECORD VALIDATION
          │
          ▼
 SESSION TOKEN CREATION
          │
          ▼
 LOCAL STORAGE SESSION SAVE
          │
          ▼
 AUTHORIZED DASHBOARD ACCESS
________________________________________
Session Management
Uses:
localStorage
to persist user sessions.
________________________________________
11. Alert System Architecture
Purpose
Notify users about detected threats.
________________________________________
Alert Pipeline
SCAM DETECTED
      │
      ▼
RISK SCORE ENGINE
      │
      ▼
ALERT PRIORITY ASSIGNMENT
      │
      ├── LOW
      ├── MEDIUM
      ├── HIGH
      └── CRITICAL
               │
               ▼
      USER NOTIFICATION PANEL
________________________________________
12. OCR Architecture
Technology Used:
Tesseract.js
________________________________________
OCR Flow
IMAGE UPLOAD
      │
      ▼
TESSERACT OCR ENGINE
      │
      ▼
TEXT EXTRACTION
      │
      ▼
SCAM ANALYSIS ENGINE
________________________________________
13. AI Architecture
Technology:
Google Gemini API
Package:
@google/genai
________________________________________
AI Responsibilities
•	Scam classification
•	Fraud summarization
•	Risk scoring
•	Conversational AI
•	Threat explanation
•	User guidance
•	Deepfake reasoning
________________________________________
14. Security Architecture
Security Layers
Frontend Security
•	Session validation
•	Input sanitization
•	Safe routing
Backend Security
•	JSON request validation
•	API isolation
•	Controlled AI prompts
AI Safety
•	Fallback rules engine
•	Error handling
•	Quota protection
Data Security
•	Local isolated storage
•	Structured collection system
•	Controlled data access
________________________________________
15. Deployment Architecture
Development
npm install
npm run dev
________________________________________
Production Build
vite build
esbuild server.ts
________________________________________
Runtime Flow
Frontend (Vite React)
        │
        ▼
Backend Express Server
        │
        ▼
Gemini AI + JSON Storage
________________________________________
16. Actual Technology Stack Used
Layer	Technology
Frontend	React 19
Language	TypeScript
Build Tool	Vite
Backend	Express.js
AI Engine	Google Gemini
OCR	Tesseract.js
Styling	TailwindCSS
Icons	Lucide React
Motion	Motion Library
Database	JSON File Collections
Runtime	Node.js
________________________________________
17. Final System Architecture Summary
CitizenX Shield works as a complete cyber fraud intelligence ecosystem.
The platform:
1.	Accepts user inputs
2.	Extracts information using OCR
3.	Uses Gemini AI for analysis
4.	Detects scams/deepfakes
5.	Generates risk scores
6.	Stores reports securely
7.	Correlates connected fraud events
8.	Visualizes scam intelligence
9.	Assists users through SIA AI assistant
10.	Provides real-time fraud awareness and protection
________________________________________
18. Most Important Technical Highlight
A major architectural strength of CitizenX Shield is:
Hybrid AI + Local Rules Engine Architecture
Meaning:
•	Primary detection uses Gemini AI
•	If AI quota fails or API errors occur,
•	The system automatically switches to local fraud detection rules.
This ensures:
•	High availability
•	Reliability
•	Continuous protection
•	Reduced dependency failure
________________________________________
19. Innovation Highlights for Judges
Unique Features
AI + OCR Combined Scam Detection
Detects scams from screenshots and messages.
Intelligence Correlation Engine
Connects scam reports into fraud networks.
Hybrid AI Detection
Works even when AI quota fails.
Cyber Safety Assistant (SIA)
Guides users in real-time.
Threat Visualization
Shows connected fraud activities.
Multi-Module Cyber Protection
Single platform for scam detection, deepfake detection, verification, and reporting.
________________________________________
20. Conclusion
CitizenX Shield is not just a reporting app.
It is a:
Real-Time AI Cyber Defense & Fraud Intelligence Platform
designed to:
•	Detect scams
•	Prevent fraud
•	Analyze threats
•	Assist victims
•	Build cyber intelligence
•	Improve digital safety for citizens