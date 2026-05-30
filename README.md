# StudentFlow CRM

StudentFlow is a workflow-driven CRM built to manage the student application lifecycle from initial enquiry to final university enrolment. It features a strict stage-based state machine, role-based application routing, dynamic contextual action calculations, and automated eligibility review checks.

---

## Tech Stack

*   **Frontend**: Angular 20, PrimeNG, SCSS
*   **Backend**: Node.js, Express.js (JWT Authentication)
*   **Database**: MongoDB (via Mongoose)

---

## How the Workflow Works

Applications move through the pipeline step-by-step to keep records clean and prevent data corruption.

```txt
NEW_APP ──► QA_REVIEW ──► APP_REVIEW ──► DECISION ──► DEPOSIT ──► CAS_REVIEW ──► ENROLMENT ──► COMPLETED
```

*   **Agents (External)**: Can only see applications they submitted, add notes, and upload files. They cannot see or trigger any internal workflow stages.
*   **Internal Staff**: Queues are filtered automatically based on the logged-in user's role:
    *   *QA Officers* see applications in `NEW_APP` and `QA_REVIEW`.
    *   *Admission Officers* manage `APP_REVIEW` and `DECISION`.
    *   *Visa Officers* manage `DEPOSIT` and `CAS_REVIEW`.
    *   *Enrolment Officers* handle the final `ENROLMENT` stage.
*   **Admins**: Full dashboard metrics access and user management CRUD permissions.

---

## Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) running locally.

### 2. Backend Setup
1. Go to the backend folder:
   ```bash
   cd studentFlow-backend
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the backend folder:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/studentflow
   JWT_SECRET=some_jwt_secret_key
   ```
4. **Seed the Default Admin Account**:
   Run the seeding script to create your first admin user in MongoDB:
   ```bash
   node config/createAdmin.js
   ```
   *   **Email**: `admin@studentflow.com`
   *   **Password**: `admin123`
5. Run the dev server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and go to the frontend folder:
   ```bash
   cd studentflow-frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Angular dev server:
   ```bash
   npm start
   ```
4. Open `http://localhost:4200` in your browser.

---

## Features Implemented

*   **Role-Based Access**: Angular route guards block unauthorized page access, and the backend verifies roles for every stage transition.
*   **Gating Rules**:
    *   Cannot move from QA to App Review unless the **Passport** and **Academic Transcript** documents are verified.
    *   Cannot move from App Review to Decision unless the Admission Officer has added at least one note.
*   **Dynamic Actions**: Available actions (like *Refund*, *Drop Out*, *Defer*, *Cancel*, *Withdraw*, *Change Course*) are calculated on the fly. For instance, *Refund* only shows up post-Deposit, and *Drop Out* only post-Enrolment.
*   **AI eligibility review**: Built a swappable helper in `services/ai.service.js` that checks uploads against requirements. It operates on a native Node.js HTTPS boundary, so if the external LLM is offline or times out, it falls back gracefully to standard manual review without crashing the app.
*   **Global Error Handling**: Any backend API errors (unauthorized, validation failed, etc.) are caught globally and shown as clean toaster notifications in the UI.