# 🐛 BugBuster - Q&A Web App

BugBuster is a lightweight Q&A platform built from scratch with a Node.js backend, PostgreSQL database, and a vanilla HTML/CSS/JavaScript frontend. It allows users to register, ask and answer questions, and vote on content, similar to Stack Overflow.

## 🚀 Features

- ✅ User registration and login (with JWT authentication)
- ✅ Post new questions with optional code snippets
- ✅ Answer existing questions
- ✅ Upvote/downvote questions and answers
- ✅ View a list of recent questions
- ✅ View question details with answers
- ✅ Clean and responsive front-end UI

---

## 🛠️ Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL (via `pg`)
- JSON Web Tokens (JWT) for authentication
- MVC architecture

### Frontend
- HTML, CSS, JavaScript (vanilla)
- Modular components (navbar, cards, etc.)

### Dev Tools
- Postman (for testing API)
- Trello (project management)
- Git for version control

---

## 🏗️ Folder Structure

project-root/
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middlewares/
│ ├── database/
│ ├── app.js
│ └── server.js
├── frontend/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── App.js
│ │ └── main.js
├── README.md
└── .env

yaml
Copier
Modifier

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/bugbuster.git
cd bugbuster
2. Install backend dependencies
bash
Copier
Modifier
cd backend
npm install
3. Configure environment
Create a .env file in the backend/ folder:

ini
Copier
Modifier
PORT=5000
DATABASE_URL=postgres://your_user:your_password@localhost:5432/bugbuster
JWT_SECRET=your_jwt_secret
4. Set up the database
Make sure PostgreSQL is running, and you’re connected to the bugbuster database:

sql
Copier
Modifier
-- From psql
CREATE TABLE ...
-- (Use the schema setup provided earlier)
5. Start the backend server
bash
Copier
Modifier
npm start
6. Open the frontend
Open frontend/public/index.html in a browser or serve it using a simple HTTP server.

🧪 Testing
Use Postman to test:

Register/Login endpoints

CRUD operations for Questions and Answers

Voting routes

Or test the full flow manually through the frontend.

📚 API Overview
Example:

bash
Copier
Modifier
GET /questions
POST /questions
GET /questions/:id
POST /questions/:id/answers
POST /questions/:id/vote
(All endpoints expect and return JSON)

👨‍💻 Author
Name: Your Name

Email: youremail@example.com

Role: Full-Stack Developer

📄 License
This project is for educational purposes only.
