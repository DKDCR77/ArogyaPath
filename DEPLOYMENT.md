# ArogyaPath Deployment Guide

## Architecture
- **Frontend (Next.js)** → Vercel
- **Backend (Node.js)** → Render
- **AI Service (Python FastAPI)** → Render

## Step 1: Deploy Python AI Service to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: arogyapath-ai
   - **Root Directory**: backend/app
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main2_fast.py`
5. Click "Create Web Service"
6. Copy the deployed URL (e.g., `https://arogyapath-ai.onrender.com`)

## Step 2: Deploy Node.js Backend to Render

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: arogyapath-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a random secret key
   - `GROQ_API_KEY`: Your Groq API key (optional for AI reports)
   - `PORT`: 3001
   - `FRONTEND_URL`: (will add after deploying frontend)
5. Click "Create Web Service"
6. Copy the deployed URL (e.g., `https://arogyapath-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
5. Add Environment Variables:
   - `NEXT_PUBLIC_BACKEND_URL`: Your Render backend URL
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
6. Click "Deploy"
7. Copy the deployed URL (e.g., `https://arogyapath.vercel.app`)

## Step 4: Update Environment Variables

1. Go back to Render Backend service → Environment
2. Update `FRONTEND_URL` with your Vercel URL
3. Click "Save Changes"

## Step 5: Update Frontend Environment Variables

1. Go to Vercel project → Settings → Environment Variables
2. Update:
   - `NEXT_PUBLIC_BACKEND_URL`: https://arogyapath-backend.onrender.com
   - `NEXT_PUBLIC_API_URL`: https://arogyapath-backend.onrender.com

## Important Notes

### MongoDB Atlas Setup
Ensure your MongoDB Atlas is configured to accept connections from anywhere:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allows all IPs)

### Render Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds
- Consider upgrading for production use

### File Storage
- Render ephemeral storage means uploaded files are lost on restart
- For production, use:
  - AWS S3
  - Cloudinary
  - Vercel Blob Storage

## Quick Deploy Commands

### Update and redeploy:
```bash
# Push to GitHub
git add .
git commit -m "Deploy updates"
git push origin main

# Vercel and Render will auto-deploy
```

## Environment Variables Summary

### Frontend (Vercel)
```
NEXT_PUBLIC_BACKEND_URL=https://arogyapath-backend.onrender.com
NEXT_PUBLIC_API_URL=https://arogyapath-backend.onrender.com
```

### Backend (Render)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arogyapath
JWT_SECRET=your-super-secret-jwt-key-here
GROQ_API_KEY=your-groq-api-key (optional)
PORT=3001
FRONTEND_URL=https://arogyapath.vercel.app
NODE_ENV=production
```

### Python AI (Render)
```
PYTHON_VERSION=3.11.0
```

## Testing Deployment

1. Visit your Vercel URL
2. Try uploading an MRI scan
3. Generate a report
4. Check all features work

## Troubleshooting

### Backend not responding
- Check Render logs: Dashboard → Service → Logs
- Verify environment variables are set
- Check MongoDB Atlas IP whitelist

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_BACKEND_URL is correct
- Check CORS settings in backend
- Ensure backend is running (not spun down)

### AI predictions failing
- Check Python service logs
- Verify model file is included in deployment
- May need to upgrade Render plan for larger model files

## Production Checklist

- [ ] MongoDB Atlas configured with proper IP access
- [ ] All environment variables set correctly
- [ ] CORS configured for your domains
- [ ] JWT_SECRET is strong and secure
- [ ] Test all features in production
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain (optional)
- [ ] Set up backup strategy for database
