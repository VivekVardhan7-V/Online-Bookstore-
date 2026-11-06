# Online Book Store Management System

This project contains a full-stack MERN bookstore application with an Express API and a React frontend.

## Structure

- `backend/` - Express, MongoDB, Mongoose, JWT auth, REST API
- `frontend/` - Vite React client

## Admin features

Sign in using the seeded administrator account to manage books, categories, orders, and customer accounts. The admin navigation includes book search and add/edit/delete, order status and payment updates, shipping carrier/tracking number/estimated delivery updates with a tracking history, and customer details with order history.

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

## Environment setup

1. Copy `backend/.env.example` to `backend/.env`
2. Update the values with your MongoDB URI and JWT secret
3. Run command below from the project root

## Install dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

## Run development servers

```bash
npm run dev
```

The app runs with:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Default admin account

If no admin user exists, the app will create one automatically:

- Email: admin@bookstore.com
- Password: Admin@123

## Production build

```bash
npm run build
```

## Notes

- The backend exposes REST endpoints under `/api`
- Uploaded book covers are stored under `backend/uploads`
- The frontend is built with Vite and uses context-based auth/cart state
