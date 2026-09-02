# 🍬 Mithai Mandir – Bakery E-Commerce Platform

A full-stack e-commerce web application for an online bakery shop, built with **React (Vite)** on the frontend and **Node.js + Express** on the backend.

---

## 📁 Project Structure

```
Mini capstone project/
├── backend/       # Node.js + Express REST API
└── frontend/      # React + Vite frontend
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

The API will run at `http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173`

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router, Axios, Vite |
| Backend   | Node.js, Express, JWT, Multer       |
| Auth      | JWT (JSON Web Tokens) + bcryptjs    |

---

## 📌 Features

- 🔐 User Authentication (Register / Login with JWT)
- 🛍️ Product Listing & Management
- 🖼️ Image Upload with Multer
- 🛒 E-commerce shopping flow
- 📦 RESTful API

---

## ⚠️ Important

- Never commit your `.env` file — it contains secrets
- The `uploads/` folder is excluded from version control
