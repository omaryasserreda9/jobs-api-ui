# 🚀 Jobs API

A RESTful API for managing job listings built with **Node.js**, **Express**, and **MongoDB**.


---

## 🌐 Live Demo

Base URL:
👉 https://jobs-api-production-472a.up.railway.app/

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB & Mongoose
* JSON Web Tokens (JWT)
* Security Middleware:

  * Helmet
  * CORS
  * XSS-Clean
  * Express Rate Limit

---

## 🔐 Features

* User Authentication (Register / Login)
* JWT-based Authorization
* Protected Routes
* CRUD Operations for Jobs
* Error Handling Middleware
* Rate Limiting & Security Best Practices

---

## 📦 API Endpoints

### 🔓 Auth Routes

| Method | Endpoint                | Description         |
| ------ | ----------------------- | ------------------- |
| POST   | `/api/v1/auth/register` | Register a new user |
| POST   | `/api/v1/auth/login`    | Login and get token |

---

### 🔒 Jobs Routes (Protected)

> ⚠️ Require Bearer Token

| Method | Endpoint           | Description    |
| ------ | ------------------ | -------------- |
| GET    | `/api/v1/jobs`     | Get all jobs   |
| POST   | `/api/v1/jobs`     | Create a job   |
| GET    | `/api/v1/jobs/:id` | Get single job |
| PATCH  | `/api/v1/jobs/:id` | Update job     |
| DELETE | `/api/v1/jobs/:id` | Delete job     |

---

## 🧪 Testing (Postman)

This API is tested using **Postman**.

### Steps:

1. Register a user:

   ```http
   POST /api/v1/auth/register
   ```

2. Login:

   ```http
   POST /api/v1/auth/login
   ```

3. Copy the token from response

4. Use it in headers:

   ```http
   Authorization: Bearer YOUR_TOKEN
   ```

5. Access protected routes:

   ```http
   GET /api/v1/jobs
   ```

---

## ⚙️ Environment Variables

Create a `.env` file and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_LIFETIME=1d
```

---

## 🚀 Run Locally

```bash
git clone https://github.com/your-username/jobs-api.git
cd jobs-api
npm install
npm start
```

---

## 📌 Notes

* All job routes are protected using JWT authentication.
* Deployed using Railway.

---




