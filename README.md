# Lost & Found Item Management System

A full-stack MERN web application built for a college campus to manage lost and found items.

## Technology Stack
- **Database:** MongoDB & Mongoose
- **Backend:** Express.js & Node.js
- **Frontend:** React.js, React Router, Axios
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Styling:** CSS & Bootstrap 5

## Features
- **User Authentication:** Secure registration and login with JWT.
- **Item Management:** Report lost or found items with details like name, description, location, type, and contact info.
- **Dashboard:** View all reported items in a responsive grid.
- **Search:** Search items by name, type, or location.
- **Owner Actions:** Update or delete your own reported items.

## Project Structure
- `/backend`: Node.js + Express API server
- `/frontend`: React.js client application

## Local Setup Instructions

### Prerequisites
1. Node.js installed
2. MongoDB running locally on `mongodb://localhost:27017` or a MongoDB Atlas URI.

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies (already done if following along):
   ```bash
   npm install
   ```
3. Set up environment variables:
   Ensure the `.env` file in the backend directory has the correct MongoDB URI and JWT secret.
   ```
   MONGO_URI=mongodb://localhost:27017/lost_and_found
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (already done if following along):
   ```bash
   npm install
   ```
3. Set up environment variables:
   Ensure the `.env` file in the frontend directory points to the backend API.
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
4. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will open in your browser at `http://localhost:3000`.

## Deployment Guide

For a detailed step-by-step walkthrough on deploying to production, please refer to the [DEPLOYMENT_GUIDE.md](file:///d:/lost_and_found/DEPLOYMENT_GUIDE.md).

### Quick Summary
1. **Database**: Use MongoDB Atlas.
2. **Backend**: Deploy on Render. Set `MONGO_URI`, `JWT_SECRET`, and `PORT` env vars.
3. **Frontend**: Deploy on Vercel or Render. Set `REACT_APP_API_URL` to your backend URL.


## License
MIT
