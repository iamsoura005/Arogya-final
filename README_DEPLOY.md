# 🏥 Arogya Healthcare Platform

> AI-Powered Medical Consultation Platform with Multi-Model Image Analysis

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/iamsoura005/Arogya-final)

**Live Demo:** [Deploy yours now!](#-quick-deploy-to-vercel)

---

## 🚀 Quick Deploy to Vercel

### One-Click Deploy
1. Click the "Deploy to Vercel" button above
2. Connect your GitHub account
3. Add environment variables:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```
4. Click **Deploy**
5. Your app will be live in 2-3 minutes! 🎉

### Get Your API Keys
- **Gemini API**: https://aistudio.google.com/apikey
- **DeepSeek API**: https://platform.deepseek.com/api_keys

---

## ✨ Features

### 🔐 Enhanced User Registration
- First Name, Last Name
- Sex (Male/Female/Other)
- Age Group (0-10, 10-20, ..., 90+)
- Email & Password

### 🩺 4 Consultation Types

#### 1. Image Analysis (Single Model)
- Upload medical images
- Real-time Gemini AI analysis
- Confidence scores & severity
- **PDF Download** with patient info

#### 2. Multi-Model Comparison
- Compare 4 AI models simultaneously:
  - **Gemini API** (real analysis)
  - ResNet50 (mock)
  - OpenCV (mock)
  - YOLOv8 (mock)
- Consensus diagnosis
- **Comprehensive PDF Report**

#### 3. Chat Consultation
- AI-powered medical chatbot
- Natural conversation flow
- Full transcript with timestamps
- **PDF Download** with complete chat history

#### 4. Voice Consultation
- Voice/text input
- AI medical assistant
- Real-time responses
- **PDF Download** with transcript

### 📄 Professional PDF Reports
All consultations generate professional PDF reports with:
- Patient demographics (Name, Sex, Age Group)
- Consultation timestamp
- Complete analysis/transcript
- Medical disclaimers
- Arogya branding

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (Fast builds)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- jsPDF (PDF generation)

**AI Services:**
- Google Gemini API (Medical analysis)
- DeepSeek API (Alternative AI)

**Backend:** (Optional - not included in Vercel deploy)
- FastAPI (Python)
- SQLite (Database)
- Model evaluation pipelines

---

## 📦 Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/iamsoura005/Arogya-final.git
cd Arogya-final

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your API keys to .env
VITE_GEMINI_API_KEY=your_key_here
VITE_DEEPSEEK_API_KEY=your_key_here

# Start development server
npm run dev

# Open browser to http://localhost:5174
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🌐 Deployment Options

### ✅ Vercel (Recommended - Frontend Only)
- Automatic CI/CD from GitHub
- Free SSL certificate
- Global CDN
- Environment variables support

**[Deploy Now →](https://vercel.com/import/project?template=https://github.com/iamsoura005/Arogya-final)**

### Railway (Full Stack)
- Deploy frontend + backend together
- Free tier available
- Automatic deployments

### Netlify (Frontend Only)
- Similar to Vercel
- Easy DNS management

---

## 📖 Documentation

- **[Complete Deployment Guide](./VERCEL_DEPLOYMENT_COMPLETE.md)** - Step-by-step Vercel deployment
- **[Multi-Model Guide](./MULTI_MODEL_COMPARISON_GUIDE.md)** - Understanding the 4-model comparison
- **[User Reports Implementation](./IMPLEMENTATION_COMPLETE_USER_REPORTS.md)** - PDF generation details
- **[Complete Run Guide](./COMPLETE_RUN_GUIDE.md)** - Full setup instructions

---

## 🔒 Security Notes

### ⚠️ Important
- API keys should be stored in environment variables
- Never commit API keys to git
- Rotate keys after public deployment
- Enable API restrictions in Google Cloud Console

### Recommended Setup
1. Use Vercel Environment Variables
2. Enable domain restrictions on API keys
3. Set up usage quotas
4. Monitor API usage regularly

---

## 📸 Screenshots

### Landing Page
Beautiful, modern healthcare interface with animations

### Enhanced Registration
Comprehensive user data collection with demographics

### Multi-Model Comparison
Real-time comparison of 4 AI models

### Professional PDF Reports
Medical-grade reports with patient information

---

## 🎯 Use Cases

✅ **Telemedicine Platforms** - Virtual consultations
✅ **Healthcare Startups** - MVP for medical apps
✅ **Medical Education** - AI-assisted learning
✅ **Research Projects** - Multi-model comparison studies
✅ **Health Tech Demos** - Showcase AI capabilities

---

## 🧪 Testing

### Test Credentials (Demo Mode)
```
Email: demo@arogya.com
Password: demo123
```

### Test Features
1. Sign up with custom details
2. Upload medical image (try skin condition photos)
3. Test multi-model comparison
4. Download PDF reports
5. Try chat/voice consultations

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚡ Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Get API keys (Gemini + DeepSeek)
- [ ] Add keys to `.env` file
- [ ] Run locally (`npm run dev`)
- [ ] Test all features
- [ ] Deploy to Vercel
- [ ] Add environment variables on Vercel
- [ ] Test production deployment
- [ ] Share your live URL!

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/iamsoura005/Arogya-final/issues)
- **Documentation:** Check `VERCEL_DEPLOYMENT_COMPLETE.md`
- **API Keys:** Ensure they're valid and have sufficient quota

---

## 🌟 Star This Repo

If you find this project helpful, please give it a ⭐ on GitHub!

---

## 🚀 Deploy Now

Ready to launch your own medical AI platform?

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/iamsoura005/Arogya-final)

**Made with ❤️ for better healthcare accessibility**
