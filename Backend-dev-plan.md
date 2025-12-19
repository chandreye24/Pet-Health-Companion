# Backend Development Plan: Pet Health Companion

## 1️⃣ Executive Summary

Building a FastAPI backend for India's first AI-powered pet health companion app. The backend will support user authentication, multi-pet profile management, AI symptom checking with multimodal inputs (text/image/video), veterinary provider search, and health recommendations.

**Constraints:**
- FastAPI with Python 3.13 (async)
- MongoDB Atlas (Motor + Pydantic v2)
- No Docker
- Manual testing after every task via frontend UI
- Single-branch Git workflow (`main`)
- API base path: `/api/v1/*`
- Background tasks: synchronous by default

**Sprint Structure:**
- **S0:** Environment setup & frontend connection
- **S1:** Authentication (signup/login/logout)
- **S2:** Pet profile management
- **S3:** AI symptom checker
- **S4:** Provider recommendations
- **S5:** Health recommendations & alerts

---

## 2️⃣ In-Scope & Success Criteria

**In-Scope Features:**
- User registration with email/phone OTP verification
- JWT-based authentication
- Multi-pet profile creation (max 10 per user)
- Medical history tracking per pet
- AI symptom checker with text/image/video inputs
- Risk level classification (Emergency/Urgent/Monitor/Low Risk)
- Symptom check history storage (when logged in)
- Veterinary provider search with filters
- Breed-specific health recommendations
- Seasonal health alerts based on location
- User feedback collection on AI assessments

**Success Criteria:**
- All frontend features functional end-to-end
- All task-level manual tests pass via UI
- Each sprint's code pushed to `main` after verification
- MongoDB Atlas connection stable
- JWT authentication secure and functional
- AI responses return within 30s
- Provider search returns relevant results

---

## 3️⃣ API Design

**Base Path:** `/api/v1`

**Error Envelope:** `{ "error": "message", "detail": "optional details" }`

### Authentication Endpoints

**POST /api/v1/auth/signup**
- Purpose: Register new user with email/phone
- Request: `{ "email": "string", "phone": "string", "name": "string", "termsAccepted": true, "ageConfirmed": true }`
- Response: `{ "message": "OTP sent", "userId": "string" }`
- Validation: Email format, phone format, age 18+, terms accepted

**POST /api/v1/auth/verify-otp**
- Purpose: Verify OTP and complete registration
- Request: `{ "userId": "string", "otp": "string" }`
- Response: `{ "token": "jwt_string", "user": {...} }`
- Validation: OTP valid and not expired

**POST /api/v1/auth/login**
- Purpose: Login existing user
- Request: `{ "email": "string", "phone": "string" }`
- Response: `{ "message": "OTP sent", "userId": "string" }`
- Validation: User exists

**POST /api/v1/auth/logout**
- Purpose: Logout user (client-side token removal)
- Request: None (token in header)
- Response: `{ "message": "Logged out successfully" }`

**GET /api/v1/auth/me**
- Purpose: Get current user profile
- Request: None (token in header)
- Response: `{ "user": {...} }`
- Auth: Required

**PATCH /api/v1/auth/me**
- Purpose: Update user profile (location)
- Request: `{ "location": { "latitude": float, "longitude": float, "city": "string", "state": "string" } }`
- Response: `{ "user": {...} }`
- Auth: Required

### Pet Profile Endpoints

**POST /api/v1/pets**
- Purpose: Create new pet profile
- Request: `{ "name": "string", "breed": "string", "age": float, "weight": float?, "lifestyle": "string?", "photo": "string?", "conditions": ["string"]?, "allergies": ["string"]? }`
- Response: `{ "pet": {...} }`
- Auth: Required
- Validation: Max 10 pets per user, required fields present

**GET /api/v1/pets**
- Purpose: Get all pets for current user
- Response: `{ "pets": [...] }`
- Auth: Required

**GET /api/v1/pets/{petId}**
- Purpose: Get specific pet details
- Response: `{ "pet": {...} }`
- Auth: Required

**PATCH /api/v1/pets/{petId}**
- Purpose: Update pet profile
- Request: Partial pet object
- Response: `{ "pet": {...} }`
- Auth: Required
- Validation: Cannot change createdAt

**DELETE /api/v1/pets/{petId}**
- Purpose: Delete pet profile
- Response: `{ "message": "Pet deleted" }`
- Auth: Required

**POST /api/v1/pets/{petId}/medical-history**
- Purpose: Add medical history entry
- Request: `{ "type": "string", "date": "string", "description": "string", "photos": ["string"]?, "notes": "string?" }`
- Response: `{ "entry": {...} }`
- Auth: Required

**GET /api/v1/pets/{petId}/medical-history**
- Purpose: Get medical history for pet
- Response: `{ "history": [...] }`
- Auth: Required

### Symptom Checker Endpoints

**POST /api/v1/symptom-checks**
- Purpose: Submit symptom check for AI analysis
- Request: `{ "petId": "string?", "category": "string", "healthSubcategory": "string?", "symptoms": "string", "images": ["base64_string"]?, "video": "base64_string?" }`
- Response: `{ "id": "string", "riskLevel": "string", "summary": "string", "detailedSections": [...], "immediateActions": [...], "reasoning": "string" }`
- Auth: Optional (saves history if authenticated)
- Validation: Symptoms 10-500 chars OR media present, max 3 images, video 15-60s

**GET /api/v1/symptom-checks**
- Purpose: Get symptom check history for user
- Response: `{ "checks": [...] }`
- Auth: Required

**GET /api/v1/symptom-checks/{checkId}**
- Purpose: Get specific symptom check
- Response: `{ "check": {...} }`
- Auth: Required

**POST /api/v1/symptom-checks/{checkId}/feedback**
- Purpose: Submit feedback on symptom check
- Request: `{ "feedback": "up|down", "feedbackReason": "string?" }`
- Response: `{ "message": "Feedback recorded" }`
- Auth: Optional

### Provider Endpoints

**GET /api/v1/providers**
- Purpose: Search veterinary providers
- Query Params: `city`, `latitude`, `longitude`, `radius` (5-15km), `is24x7`, `openNow`, `sortBy` (distance/rating)
- Response: `{ "providers": [...] }`
- Validation: Either city OR lat/long required

**GET /api/v1/providers/{providerId}**
- Purpose: Get provider details
- Response: `{ "provider": {...} }`

### Health Recommendations Endpoints

**GET /api/v1/recommendations/breed/{breed}**
- Purpose: Get breed-specific health tips
- Response: `{ "breed": "string", "tips": [...] }`

**GET /api/v1/recommendations/seasonal**
- Purpose: Get seasonal health alerts
- Query Params: `city`, `latitude`, `longitude`
- Response: `{ "alerts": [...] }`

**GET /api/v1/recommendations/pet/{petId}**
- Purpose: Get personalized recommendations for pet
- Response: `{ "recommendations": [...] }`
- Auth: Required

### Health Endpoints

**GET /api/v1/healthz**
- Purpose: Health check with DB ping
- Response: `{ "status": "healthy", "database": "connected", "timestamp": "string" }`

---

## 4️⃣ Data Model (MongoDB Atlas)

### users Collection

**Fields:**
- `_id`: ObjectId (auto)
- `email`: string (required, unique, indexed)
- `phone`: string (required, unique, indexed)
- `name`: string (required)
- `passwordHash`: string (for future password auth)
- `location`: object (nullable)
  - `latitude`: float
  - `longitude`: float
  - `city`: string
  - `state`: string
- `termsAccepted`: boolean (required, default: false)
- `ageConfirmed`: boolean (required, default: false)
- `createdAt`: datetime (auto)
- `updatedAt`: datetime (auto)

**Example:**
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "phone": "+919876543210",
  "name": "John Doe",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "termsAccepted": true,
  "ageConfirmed": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### otp_verifications Collection

**Fields:**
- `_id`: ObjectId (auto)
- `userId`: ObjectId (reference to users, indexed)
- `otp`: string (6 digits)
- `purpose`: string (signup/login)
- `expiresAt`: datetime (5 minutes from creation)
- `verified`: boolean (default: false)
- `createdAt`: datetime (auto)

**Example:**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "otp": "123456",
  "purpose": "signup",
  "expiresAt": "2025-01-01T00:05:00Z",
  "verified": false,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### pets Collection

**Fields:**
- `_id`: ObjectId (auto)
- `userId`: ObjectId (reference to users, indexed)
- `name`: string (required)
- `breed`: string (required)
- `age`: float (required, years)
- `weight`: float (optional, kg)
- `photo`: string (optional, base64 or URL)
- `lifestyle`: string (optional, enum: indoor/outdoor/mixed)
- `conditions`: array of strings (optional)
- `allergies`: array of strings (optional)
- `createdAt`: datetime (auto)
- `updatedAt`: datetime (auto)

**Example:**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "name": "Max",
  "breed": "Labrador Retriever",
  "age": 3.5,
  "weight": 28.5,
  "lifestyle": "mixed",
  "conditions": ["Hip Dysplasia"],
  "allergies": ["Chicken"],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### medical_history Collection

**Fields:**
- `_id`: ObjectId (auto)
- `petId`: ObjectId (reference to pets, indexed)
- `type`: string (enum: vaccination/illness/surgery/checkup/other)
- `date`: datetime (required)
- `description`: string (required)
- `photos`: array of strings (optional, base64 or URLs)
- `notes`: string (optional)
- `createdAt`: datetime (auto)

**Example:**
```json
{
  "_id": "ObjectId",
  "petId": "ObjectId",
  "type": "vaccination",
  "date": "2024-12-01T00:00:00Z",
  "description": "Rabies vaccination",
  "photos": [],
  "notes": "Next due in 1 year",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### symptom_checks Collection

**Fields:**
- `_id`: ObjectId (auto)
- `userId`: ObjectId (reference to users, indexed, nullable for anonymous)
- `petId`: ObjectId (reference to pets, indexed, nullable)
- `category`: string (enum: Nutrition/Exercise/Grooming/Health/Seasonal)
- `healthSubcategory`: string (optional, enum from PRD)
- `symptoms`: string (required)
- `images`: array of strings (optional, base64, max 3)
- `video`: string (optional, base64)
- `riskLevel`: string (enum: Emergency/Urgent/Monitor/Low Risk)
- `summary`: string
- `detailedSections`: array of objects
  - `title`: string
  - `points`: array of strings
- `immediateActions`: array of strings
- `reasoning`: string
- `feedback`: string (optional, enum: up/down)
- `feedbackReason`: string (optional)
- `timestamp`: datetime (auto)

**Example:**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "petId": "ObjectId",
  "category": "Health",
  "healthSubcategory": "Digestive Issues",
  "symptoms": "Dog has been vomiting for 2 days",
  "images": [],
  "riskLevel": "Urgent",
  "summary": "Persistent vomiting requires vet attention",
  "detailedSections": [
    {
      "title": "Immediate Care",
      "points": ["Withhold food for 12 hours", "Provide small amounts of water"]
    }
  ],
  "immediateActions": ["Contact vet within 24 hours"],
  "reasoning": "Vomiting for 2+ days can lead to dehydration",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### providers Collection

**Fields:**
- `_id`: ObjectId (auto)
- `name`: string (required)
- `phone`: string (required)
- `address`: string (required)
- `city`: string (required, indexed)
- `state`: string (required)
- `latitude`: float (required, indexed)
- `longitude`: float (required, indexed)
- `operatingHours`: string (required)
- `rating`: float (default: 0)
- `is24x7`: boolean (default: false, indexed)
- `services`: array of strings (optional)
- `createdAt`: datetime (auto)
- `updatedAt`: datetime (auto)

**Example:**
```json
{
  "_id": "ObjectId",
  "name": "Pet Care Veterinary Clinic",
  "phone": "+919876543210",
  "address": "Shop 12, Linking Road, Bandra West",
  "city": "Mumbai",
  "state": "Maharashtra",
  "latitude": 19.0596,
  "longitude": 72.8295,
  "operatingHours": "9:00 AM - 9:00 PM",
  "rating": 4.5,
  "is24x7": false,
  "services": ["General Checkup", "Surgery", "Emergency Care"],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

## 5️⃣ Configuration & ENV Vars

**Required Environment Variables:**
- `APP_ENV` — environment (development/production)
- `PORT` — HTTP port (default: 8000)
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — token signing key (min 32 chars)
- `JWT_EXPIRES_IN` — seconds before JWT expiry (default: 604800 = 7 days)
- `CORS_ORIGINS` — allowed frontend URL(s) (comma-separated)
- `OTP_EXPIRY_MINUTES` — OTP validity period (default: 5)
- `SMS_API_KEY` — SMS gateway API key (for OTP)
- `EMAIL_API_KEY` — Email service API key (for OTP)
- `OPENAI_API_KEY` — OpenAI API key for AI symptom analysis
- `WEATHER_API_KEY` — Weather API key for seasonal alerts

---

## 6️⃣ Background Work

**OTP Cleanup Task:**
- Trigger: Scheduled (every hour)
- Purpose: Delete expired OTP records
- Idempotency: Query by `expiresAt < now()`
- UI Check: None (internal maintenance)

**Symptom Check Cleanup (Future):**
- Trigger: Scheduled (daily)
- Purpose: Archive old anonymous symptom checks (>90 days)
- Idempotency: Query by timestamp
- UI Check: None

---

## 7️⃣ Integrations

**SMS Gateway (OTP Delivery):**
- Service: Twilio or MSG91
- Flow: Generate 6-digit OTP → Send via SMS → Store in DB with expiry
- ENV: `SMS_API_KEY`, `SMS_SENDER_ID`

**Email Service (OTP Delivery):**
- Service: SendGrid or AWS SES
- Flow: Generate 6-digit OTP → Send via email → Store in DB with expiry
- ENV: `EMAIL_API_KEY`, `EMAIL_FROM`

**OpenAI API (AI Symptom Analysis):**
- Service: OpenAI GPT-4 Vision
- Flow: Send symptoms + images → Receive risk assessment + recommendations
- ENV: `OPENAI_API_KEY`
- Timeout: 30s max

**Weather API (Seasonal Alerts):**
- Service: OpenWeatherMap
- Flow: Query by city/coordinates → Get current weather + forecast
- ENV: `WEATHER_API_KEY`

**Google Maps API (Provider Directions):**
- Frontend integration only
- Backend provides lat/long for each provider

---

## 8️⃣ Testing Strategy (Manual via Frontend)

**Testing Approach:**
- All validation through frontend UI
- Every task includes Manual Test Step + User Test Prompt
- After all tasks in sprint pass → commit and push to `main`
- If any fail → fix and retest before pushing

**Test Documentation Format:**
- **Manual Test Step:** Exact UI action + expected result
- **User Test Prompt:** Copy-paste friendly instruction

---

## 9️⃣ Sprint Plan & Backlog

---

## 🧱 S0 – Environment Setup & Frontend Connection

**Objectives:**
- Create FastAPI skeleton with `/api/v1` base path
- Connect to MongoDB Atlas using `MONGODB_URI`
- Implement `/healthz` endpoint with DB ping
- Enable CORS for frontend
- Replace dummy API URLs in frontend with real backend URLs
- Initialize Git repo with `main` branch and push to GitHub
- Create `.gitignore` at root

**User Stories:**
- As a developer, I need a working FastAPI backend connected to MongoDB Atlas
- As a developer, I need CORS enabled so frontend can call backend APIs
- As a developer, I need a health check endpoint to verify DB connection

**Tasks:**

### Task 1: Initialize FastAPI Project Structure
- Create `backend/` directory at project root
- Create `backend/main.py` with FastAPI app
- Create `backend/requirements.txt` with dependencies:
  - `fastapi==0.115.0`
  - `uvicorn[standard]==0.32.0`
  - `motor==3.6.0`
  - `pydantic==2.10.0`
  - `pydantic-settings==2.6.0`
  - `python-jose[cryptography]==3.3.0`
  - `passlib[argon2]==1.7.4`
  - `python-multipart==0.0.12`
  - `httpx==0.27.0`
  - `openai==1.54.0`
- Create `backend/.env.example` with all required env vars
- Create `backend/app/` directory structure:
  - `app/__init__.py`
  - `app/config.py` (Pydantic settings)
  - `app/database.py` (Motor client)
  - `app/models/` (Pydantic models)
  - `app/routers/` (API routes)
  - `app/services/` (business logic)
  - `app/utils/` (helpers)

**Manual Test Step:** Run `uvicorn backend.main:app --reload` → Server starts on port 8000 without errors

**User Test Prompt:** "Start the backend server and confirm it runs without errors on http://localhost:8000"

### Task 2: Configure MongoDB Atlas Connection
- Implement `app/database.py` with Motor async client
- Create connection function with retry logic
- Add connection test on startup
- Handle connection errors gracefully

**Manual Test Step:** Start backend → Check logs for "MongoDB connected successfully"

**User Test Prompt:** "Start the backend and verify MongoDB connection success message in logs"

### Task 3: Implement Health Check Endpoint
- Create `app/routers/health.py`
- Implement `GET /healthz` endpoint
- Perform DB ping and return JSON: `{ "status": "healthy", "database": "connected", "timestamp": "ISO8601" }`
- Handle DB connection failures

**Manual Test Step:** Open browser → Navigate to `http://localhost:8000/healthz` → See 200 OK with DB status

**User Test Prompt:** "Open http://localhost:8000/healthz in your browser and confirm you see a healthy status with database connected"

### Task 4: Configure CORS for Frontend
- Add CORS middleware to FastAPI app
- Allow origins from `CORS_ORIGINS` env var
- Allow credentials, all methods, all headers
- Test preflight requests

**Manual Test Step:** Start frontend → Open DevTools Network tab → Make any API call → No CORS errors

**User Test Prompt:** "Start both frontend and backend, open browser DevTools, and confirm no CORS errors when frontend makes API calls"

### Task 5: Initialize Git Repository
- Run `git init` at project root (if not already initialized)
- Create `.gitignore` at root with:
  - `__pycache__/`
  - `*.pyc`
  - `*.pyo`
  - `.env`
  - `.venv/`
  - `venv/`
  - `.DS_Store`
  - `*.log`
- Set default branch to `main`: `git branch -M main`
- Create initial commit
- Create GitHub repo and push

**Manual Test Step:** Run `git status` → See clean working tree → Check GitHub → Repo exists with code

**User Test Prompt:** "Run 'git status' to confirm clean state, then check GitHub to verify the repository exists with your code"

**Definition of Done:**
- Backend runs locally on port 8000
- MongoDB Atlas connection successful
- `/healthz` returns 200 OK with DB status
- CORS enabled for frontend
- Git repo initialized with `main` branch
- Code pushed to GitHub

**Post-sprint:** Commit and push to `main`

---

## 🧩 S1 – Authentication (Signup / Login / Logout)

**Objectives:**
- Implement JWT-based signup with OTP verification
- Implement login with OTP
- Implement logout (client-side token removal)
- Protect `/api/v1/auth/me` endpoint

**User Stories:**
- As a user, I can sign up with email/phone and receive OTP
- As a user, I can verify OTP to complete registration
- As a user, I can log in with email/phone and receive OTP
- As a user, I can log out and my session ends
- As a user, I can view my profile when authenticated

**Tasks:**

### Task 1: Create User and OTP Models
- Create `app/models/user.py` with Pydantic User model
- Create `app/models/otp.py` with OTP verification model
- Add validation for email format, phone format
- Add password hashing utilities in `app/utils/security.py`

**Manual Test Step:** None (internal models)

**User Test Prompt:** "No UI test needed - models are internal"

### Task 2: Implement Signup Endpoint
- Create `app/routers/auth.py`
- Implement `POST /api/v1/auth/signup`
- Validate email, phone, terms, age confirmation
- Check if user already exists
- Generate 6-digit OTP
- Store OTP in `otp_verifications` collection with 5-min expiry
- Send OTP via SMS/Email (mock for now)
- Return `{ "message": "OTP sent", "userId": "string" }`

**Manual Test Step:** Open frontend signup page → Enter email/phone → Click signup → See "OTP sent" message

**User Test Prompt:** "Go to the signup page, enter your email and phone, click signup, and confirm you see an OTP sent message"

### Task 3: Implement OTP Verification Endpoint
- Implement `POST /api/v1/auth/verify-otp`
- Validate OTP matches and not expired
- Create user in `users` collection
- Generate JWT token with user ID
- Mark OTP as verified
- Return token and user object

**Manual Test Step:** After signup → Enter OTP (use 123456 for testing) → Click verify → Redirected to dashboard with token saved

**User Test Prompt:** "After signing up, enter the OTP code (use 123456 for testing), click verify, and confirm you're redirected to the dashboard"

### Task 4: Implement Login Endpoint
- Implement `POST /api/v1/auth/login`
- Check if user exists by email or phone
- Generate new OTP
- Store OTP in DB
- Send OTP via SMS/Email
- Return `{ "message": "OTP sent", "userId": "string" }`

**Manual Test Step:** Open login page → Enter email/phone → Click login → See "OTP sent" message

**User Test Prompt:** "Go to the login page, enter your registered email/phone, click login, and confirm you see an OTP sent message"

### Task 5: Implement Get Current User Endpoint
- Implement `GET /api/v1/auth/me`
- Add JWT authentication dependency
- Extract user ID from token
- Fetch user from DB
- Return user object

**Manual Test Step:** After login → Open DevTools → Check Network tab → See `/auth/me` returns 200 with user data

**User Test Prompt:** "After logging in, open browser DevTools Network tab and confirm the /auth/me endpoint returns your user data"

### Task 6: Implement Logout Endpoint
- Implement `POST /api/v1/auth/logout`
- Return success message (token removal handled by frontend)

**Manual Test Step:** Click logout button → Redirected to welcome page → Try accessing protected page → Redirected to login

**User Test Prompt:** "Click the logout button, confirm you're redirected to the welcome page, then try accessing a protected page and verify you're redirected to login"

### Task 7: Implement Update User Profile Endpoint
- Implement `PATCH /api/v1/auth/me`
- Allow updating location only
- Validate location data
- Update user in DB
- Return updated user

**Manual Test Step:** Grant location permission → See location saved → Refresh page → Location persists

**User Test Prompt:** "Grant location permission when prompted, confirm your location is saved, then refresh the page and verify your location persists"

**Definition of Done:**
- Signup flow works end-to-end in frontend
- OTP verification completes registration
- Login flow works with OTP
- Logout clears session
- Protected routes require authentication
- User profile can be updated

**Post-sprint:** Commit and push to `main`

---

## 🧱 S2 – Pet Profile Management

**Objectives:**
- Implement CRUD operations for pet profiles
- Enforce max 10 pets per user
- Support medical history tracking
- Validate all required fields

**User Stories:**
- As a user, I can create up to 10 pet profiles
- As a user, I can view all my pets
- As a user, I can edit pet details
- As a user, I can delete a pet
- As a user, I can add medical history for each pet

**Tasks:**

### Task 1: Create Pet Model
- Create `app/models/pet.py` with Pydantic Pet model
- Add validation for required fields (name, breed, age)
- Add optional fields (weight, photo, lifestyle, conditions, allergies)
- Create `app/models/medical_history.py` model

**Manual Test Step:** None (internal models)

**User Test Prompt:** "No UI test needed - models are internal"

### Task 2: Implement Create Pet Endpoint
- Create `app/routers/pets.py`
- Implement `POST /api/v1/pets`
- Validate user has < 10 pets
- Validate required fields
- Store pet in `pets` collection
- Return created pet

**Manual Test Step:** Login → Go to pet profile page → Fill form → Click create → See success message → Pet appears in list

**User Test Prompt:** "Log in, go to the pet profile page, fill out the form with your pet's details, click create, and confirm you see a success message and your pet appears in the list"

### Task 3: Implement Get All Pets Endpoint
- Implement `GET /api/v1/pets`
- Filter by current user ID
- Return array of pets
- Sort by createdAt descending

**Manual Test Step:** Login → Navigate to dashboard → See list of all created pets

**User Test Prompt:** "Log in and navigate to the dashboard to confirm you see a list of all your created pets"

### Task 4: Implement Get Single Pet Endpoint
- Implement `GET /api/v1/pets/{petId}`
- Validate pet belongs to current user
- Return pet details

**Manual Test Step:** Click on a pet card → See detailed pet information

**User Test Prompt:** "Click on any pet card and confirm you see detailed information about that pet"

### Task 5: Implement Update Pet Endpoint
- Implement `PATCH /api/v1/pets/{petId}`
- Validate pet belongs to current user
- Prevent changing createdAt
- Update pet in DB
- Return updated pet

**Manual Test Step:** Click edit on pet → Change name/weight → Save → See updated information

**User Test Prompt:** "Click edit on a pet, change some details like name or weight, save, and confirm the updated information is displayed"

### Task 6: Implement Delete Pet Endpoint
- Implement `DELETE /api/v1/pets/{petId}`
- Validate pet belongs to current user
- Delete pet from DB
- Delete associated medical history
- Return success message

**Manual Test Step:** Click delete on pet → Confirm deletion → Pet removed from list

**User Test Prompt:** "Click delete on a pet, confirm the deletion, and verify the pet is removed from your list"

### Task 7: Implement Medical History Endpoints
- Implement `POST /api/v1/pets/{petId}/medical-history`
- Implement `GET /api/v1/pets/{petId}/medical-history`
- Validate pet belongs to current user
- Store/retrieve medical history entries

**Manual Test Step:** Open pet details → Add medical history entry → See entry in history list

**User Test Prompt:** "Open a pet's details page, add a medical history entry, and confirm it appears in the history list"

**Definition of Done:**
- Pet CRUD operations work end-to-end
- Max 10 pets enforced
- Medical history can be added and viewed
- All validations working

**Post-sprint:** Commit and push to `main`

---

## 🧱 S3 – AI Symptom Checker

**Objectives:**
- Implement symptom check submission with multimodal inputs
- Integrate OpenAI API for AI analysis
- Store symptom check history for authenticated users
- Support anonymous symptom checks
- Implement feedback collection

**User Stories:**
- As a user, I can submit symptoms with text description
- As a user, I can upload up to 3 images with symptoms
- As a user, I can upload a video (15-60s)
- As a user, I receive AI risk assessment within 30s
- As a user, I can view my symptom check history
- As a user, I can provide feedback on AI assessments

**Tasks:**

### Task 1: Create Symptom Check Model
- Create `app/models/symptom_check.py` with Pydantic model
- Add validation for text length (10-500 chars)
- Add validation for image count (max 3)
- Add validation for video duration
- Define risk level enum

**Manual Test Step:** None (internal models)

**User Test Prompt:** "No UI test needed - models are internal"

### Task 2: Implement Submit Symptom Check Endpoint
- Implement `POST /api/v1/symptom-checks`
- Accept text, images (base64), video (base64)
- Validate input constraints
- Call OpenAI API with symptoms + images
- Parse AI response into structured format
- Store check in DB (if user authenticated)
- Return risk assessment

**Manual Test Step:** Open symptom checker → Select category → Describe symptoms → Upload image → Click analyze → See risk assessment within 30s

**User Test Prompt:** "Open the symptom checker, select a category, describe symptoms, optionally upload an image, click analyze, and confirm you receive a risk assessment within 30 seconds"

### Task 3: Implement OpenAI Integration Service
- Create `app/services/ai_service.py`
- Implement function to call OpenAI GPT-4 Vision API
- Format prompt with symptom context
- Include pet profile data if available
- Parse response into risk level + recommendations
- Handle API errors and timeouts
- Add mandatory AI disclaimer to response

**Manual Test Step:** Submit symptom check → Verify AI response includes risk level, summary, detailed sections, immediate actions, reasoning, and disclaimer

**User Test Prompt:** "Submit a symptom check and verify the AI response includes risk level, summary, detailed recommendations, immediate actions, reasoning, and the AI disclaimer"

### Task 4: Implement Get Symptom Check History Endpoint
- Implement `GET /api/v1/symptom-checks`
- Filter by current user ID
- Sort by timestamp descending
- Return array of symptom checks

**Manual Test Step:** Login → Submit multiple symptom checks → Navigate to history page → See all previous checks listed

**User Test Prompt:** "Log in, submit a few symptom checks, then navigate to the history page and confirm all your previous checks are listed"

### Task 5: Implement Get Single Symptom Check Endpoint
- Implement `GET /api/v1/symptom-checks/{checkId}`
- Validate check belongs to current user
- Return full check details

**Manual Test Step:** Click on a symptom check from history → See full details including images and AI response

**User Test Prompt:** "Click on any symptom check from your history and confirm you see the full details including any uploaded images and the complete AI response"

### Task 6: Implement Feedback Endpoint
- Implement `POST /api/v1/symptom-checks/{checkId}/feedback`
- Accept feedback type (up/down) and optional reason
- Update symptom check in DB
- Return success message

**Manual Test Step:** After receiving AI assessment → Click thumbs up/down → If down, select reason → See "Thank you for feedback" message

**User Test Prompt:** "After receiving an AI assessment, click thumbs up or down, if you clicked down select a reason, and confirm you see a thank you message"

**Definition of Done:**
- Symptom check submission works with text/images/video
- AI analysis returns within 30s
- Risk levels correctly classified
- History saved for authenticated users
- Anonymous checks work without saving
- Feedback collection functional

**Post-sprint:** Commit and push to `main`

---

## 🧱 S4 – Provider Recommendations

**Objectives:**
- Implement provider search with filters
- Support location-based search (city or coordinates)
- Calculate distances from user location
- Filter by 24x7, open now, rating
- Return sorted results

**User Stories:**
- As a user, I can search for vets by city
- As a user, I can search for vets near my location
- As a user, I can filter by 24x7 clinics
- As a user, I can filter by open now
- As a user, I can sort by distance or rating
- As a user, I can view provider details

**Tasks:**

### Task 1: Seed Provider Data
- Create `app/services/seed_data.py`
- Add function to seed providers collection
- Use data from frontend mockData.ts
- Add providers for major Indian cities
- Run seed script on first deployment

**Manual Test Step:** Run seed script → Check MongoDB → Verify providers collection has data

**User Test Prompt:** "Run the seed script and verify the providers collection in MongoDB has been populated with clinic data"

### Task 2: Implement Provider Search Endpoint
- Create `app/routers/providers.py`
- Implement `GET /api/v1/providers`
- Accept query params: city, latitude, longitude, radius, is24x7, sortBy
- Calculate distances using Haversine formula if lat/long provided
- Filter by city if provided
- Filter by 24x7 if requested
- Sort by distance or rating
- Return array of providers with distances

**Manual Test Step:** Open providers page → See list of clinics → Change city filter → See filtered results

**User Test Prompt:** "Open the providers page, confirm you see a list of clinics, then change the city filter and verify the results update accordingly"

### Task 3: Implement Distance Calculation
- Create `app/utils/geo.py`
- Implement Haversine formula for distance calculation
- Add function to calculate distance between two coordinates
- Return distance in kilometers

**Manual Test Step:** Grant location permission → Open providers page → See clinics sorted by distance with "X km away" badges

**User Test Prompt:** "Grant location permission, open the providers page, and confirm clinics are sorted by distance with distance badges showing"

### Task 4: Implement 24x7 Filter
- Add filter logic for is24x7 field
- Return only 24x7 clinics when filter active

**Manual Test Step:** Check "24/7 Only" filter → See only clinics with 24/7 badge

**User Test Prompt:** "Check the '24/7 Only' filter and confirm only clinics with the 24/7 badge are displayed"

### Task 5: Implement Get Single Provider Endpoint
- Implement `GET /api/v1/providers/{providerId}`
- Return provider details
- Include all fields

**Manual Test Step:** Click on a provider card → See detailed information (name, address, phone, hours, rating)

**User Test Prompt:** "Click on any provider card and confirm you see detailed information including name, address, phone, operating hours, and rating"

### Task 6: Implement Emergency Provider Search
- Add special handling for emergency risk level
- Auto-filter to 24x7 clinics
- Sort by distance
- Return nearest emergency clinics

**Manual Test Step:** Submit symptom check with emergency risk → See "Find Nearest Emergency Vet" button → Click → See 24x7 clinics sorted by distance

**User Test Prompt:** "Submit a symptom check that results in emergency risk level, click the 'Find Nearest Emergency Vet' button, and confirm you see 24/7 clinics sorted by distance"

**Definition of Done:**
- Provider search works by city and location
- Distance calculation accurate
- Filters work correctly
- Sorting by distance and rating functional
- Emergency provider search prioritizes 24x7 clinics

**Post-sprint:** Commit and push to `main`

---

## 🧱 S5 – Health Recommendations & Alerts

**Objectives:**
- Implement breed-specific health tips
- Implement seasonal health alerts based on location
- Implement personalized recommendations for pets
- Integrate weather API for seasonal alerts

**User Stories:**
- As a user, I can view breed-specific health tips
- As a user, I receive seasonal alerts based on my location
- As a user, I get personalized recommendations for my pet
- As a user, I see weather-based health warnings

**Tasks:**

### Task 1: Seed Breed Health Data
- Create breed health tips data in `app/data/breed_tips.py`
- Use data from frontend mockData.ts
- Add tips for common Indian breeds
- Store in memory or MongoDB

**Manual Test Step:** None (internal data)

**User Test Prompt:** "No UI test needed - data seeding is internal"

### Task 2: Implement Breed Recommendations Endpoint
- Create `app/routers/recommendations.py`
- Implement `GET /api/v1/recommendations/breed/{breed}`
- Return breed-specific health tips
- Include common health issues
- Include care recommendations

**Manual Test Step:** Create pet with specific breed → View dashboard → See breed-specific health tips widget

**User Test Prompt:** "Create a pet with a specific breed, view the dashboard, and confirm you see breed-specific health tips displayed"

### Task 3: Implement Seasonal Alerts Endpoint
- Implement `GET /api/v1/recommendations/seasonal`
- Accept city or lat/long as query params
- Determine current season based on date
- Return relevant seasonal alerts
- Include monsoon, summer, winter alerts

**Manual Test Step:** View dashboard → See seasonal alert banner (e.g., "Monsoon Tick Alert" in July)

**User Test Prompt:** "View the dashboard and confirm you see a seasonal alert banner relevant to the current season"

### Task 4: Integrate Weather API
- Create `app/services/weather_service.py`
- Implement OpenWeatherMap API integration
- Fetch current weather by city or coordinates
- Parse temperature, conditions, humidity
- Generate weather-based alerts (heatstroke warning if >35°C)

**Manual Test Step:** View dashboard on hot day → See "Summer Heatstroke Warning" alert

**User Test Prompt:** "View the dashboard and confirm you see weather-based health alerts appropriate for current conditions"

### Task 5: Implement Personalized Pet Recommendations
- Implement `GET /api/v1/recommendations/pet/{petId}`
- Combine breed tips + seasonal alerts + weather warnings
- Consider pet age, weight, lifestyle
- Consider user location
- Return personalized recommendation list

**Manual Test Step:** Select a pet → View pet profile → See personalized recommendations section with breed, seasonal, and weather-based tips

**User Test Prompt:** "Select a pet, view their profile, and confirm you see personalized recommendations combining breed-specific, seasonal, and weather-based tips"

### Task 6: Implement Health Summary Generation
- Create endpoint to generate 6-month health summary
- Analyze symptom check history
- Identify patterns and trends
- Generate summary report
- Include recommendations

**Manual Test Step:** After 6 months of symptom checks → Request health summary → See comprehensive report with trends and recommendations

**User Test Prompt:** "After accumulating symptom check history, request a health summary and confirm you see a comprehensive report with trends and recommendations"

**Definition of Done:**
- Breed-specific tips display correctly
- Seasonal alerts show based on date and location
- Weather API integration working
- Personalized recommendations combine all factors
- Health summary generation functional

**Post-sprint:** Commit and push to `main`

---

## ✅ STYLE & COMPLIANCE CHECKS

**Verification Checklist:**
- ✅ All responses use bullets only (no tables or prose)
- ✅ Only features visible in frontend are included
- ✅ APIs and models aligned with UI requirements
- ✅ MongoDB Atlas only (no local instance)
- ✅ Python 3.13 runtime specified
- ✅ Each task has Manual Test Step + User Test Prompt
- ✅ After all sprint tests pass → commit & push to `main`
- ✅ FastAPI with async/await patterns
- ✅ Motor for MongoDB async operations
- ✅ Pydantic v2 for data validation
- ✅ JWT authentication implemented
- ✅ CORS configured for frontend
- ✅ API base path `/api/v1/*`
- ✅ Error envelope format specified
- ✅ Background tasks documented
- ✅ Integration requirements listed
- ✅ ENV vars documented

---

## 🎯 FINAL NOTES

**Development Workflow:**
1. Complete all tasks in a sprint
2. Test each task manually via frontend UI
3. Fix any issues before proceeding
4. After all sprint tasks pass → commit and push to `main`
5. Move to next sprint

**Testing Reminders:**
- Every task must be tested via frontend before marking complete
- Use provided User Test Prompts for consistent testing
- Document any deviations or issues encountered
- Ensure all validations work as expected

**Git Workflow:**
- Single branch: `main`
- Commit after each sprint completion
- Use descriptive commit messages
- Push to GitHub after verification

**Success Metrics:**
- All frontend features functional
- All API endpoints responding correctly
- All validations working
- All integrations operational
- Zero critical bugs in production

---

**END OF BACKEND DEVELOPMENT PLAN**
