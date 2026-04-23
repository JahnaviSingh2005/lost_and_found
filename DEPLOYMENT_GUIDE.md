# Deployment Guide - Lost & Found Item Management System

This guide provides step-by-step instructions to deploy your MERN stack application to production using **MongoDB Atlas**, **Render** (Backend), and **Vercel** (Frontend).

---

## 1. Prepare for Deployment

### GitHub Repository Setup
Before deploying, ensure your code is pushed to a GitHub repository.
1. Create a new repository on GitHub.
2. Initialize git in your project root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

---

## 2. Database Setup (MongoDB Atlas)

1. **Create Account**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Create Cluster**: Create a new free tier (M0) cluster.
3. **Database User**: Go to **Database Access** and create a user with a password (note these down).
4. **Network Access**: Go to **Network Access** and click **Add IP Address**. Choose "Allow Access from Anywhere" (0.0.0.0/0) for deployment.
5. **Get Connection String**:
   - Go to **Database** -> **Connect** -> **Connect your application**.
   - Copy the SRV string: `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   - Replace `<password>` with your actual database user password.

---

## 3. Backend Deployment (Render)

1. **Login**: Sign up at [render.com](https://render.com).
2. **New Web Service**: Click **New +** -> **Web Service**.
3. **Connect Repo**: Connect your GitHub repository.
4. **Configuration**:
   - **Name**: `lost-and-found-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables**:
   Click **Advanced** -> **Add Environment Variable**:
   - `MONGO_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (A long, random string)
   - `PORT`: `10000` (Render's default)
6. **Deploy**: Click **Create Web Service**. Wait for the build to finish.
7. **Copy URL**: Note down your backend URL (e.g., `https://lost-and-found-backend.onrender.com`).

---

## 4. Frontend Deployment (Vercel)

1. **Login**: Sign up at [vercel.com](https://vercel.com).
2. **Add New**: Click **Add New** -> **Project**.
3. **Connect Repo**: Select your GitHub repository.
4. **Configuration**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. **Environment Variables**:
   Add the following variable:
   - `REACT_APP_API_URL`: (Paste your Render Backend URL from Step 3)
6. **Deploy**: Click **Deploy**. Vercel will build and host your site.

---

## 5. Post-Deployment Checklist

### CORS Configuration
If you experience "CORS" errors in the browser console after deployment:
1. Go to `backend/server.js`.
2. Update the CORS middleware to allow your specific frontend URL:
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend-url.vercel.app'
   }));
   ```
3. Commit and push the changes to GitHub. Render will automatically redeploy.

### Environment Variable Updates
If you change your backend URL, remember to update the `REACT_APP_API_URL` in the Vercel dashboard and trigger a new deployment.

### Testing
1. Visit your Vercel URL.
2. Try registering a new user.
3. Try adding an item to verify the connection between Frontend, Backend, and MongoDB Atlas.
