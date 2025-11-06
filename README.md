# 🏥 Arogya - AI-Powered Medical Consultation Platform

An advanced, production-ready healthcare platform that provides intelligent medical consultations through multiple channels: AI Chatbot, Voice Bot, Medical Image Analysis, and Interactive Symptom Checker.

![Arogya Banner](https://via.placeholder.com/1200x300?text=Arogya+Medical+Platform)

## ✨ Key Features

### 🤖 **AI Chatbot Consultation**
- Real-time conversation with AI doctor
- Diagnostic question flow (2-5 questions before diagnosis)
- Natural, human-like doctor responses
- Full conversation history capture
- Prescription download with full conversation details

### 🎤 **Voice Bot Interface**
- Speech-to-text powered consultation
- Natural voice interaction
- Same medical expertise as chatbot
- Text-to-speech responses
- Doctor avatar animations

### 🖼️ **Medical Image Analysis**
- Upload and analyze medical images
- AI-powered diagnosis with confidence scores
- Multiple medical condition detection:
  - Skin conditions (acne, psoriasis, eczema, fungal infections, etc.)
  - Eye diseases (conjunctivitis, cataracts, glaucoma, etc.)
  - Oral conditions (thrush, gingivitis, stomatitis, etc.)
- Severity assessment
- Specialist recommendations

### 🔬 **Intelligent Symptom Checker**
- Multi-symptom selection interface (20+ common symptoms)
- Automated disease detection
- **Specific medications** with:
  - Medicine names and dosages
  - Frequency and duration
  - Contraindications
- **Home remedies** for self-care
- **Red flag warnings** for emergency situations
- Professional assessment

### 📋 **Prescription Management**
- Download prescriptions in multiple formats (PDF, HTML, Text)
- Accessible through end-consultation dialog
- Includes full consultation history
- Professional medical formatting

### 👨‍⚕️ **Doctor Avatars**
- 4 different AI doctor representations:
  - Dr. Arogya 👨‍⚕️
  - Dr. Sarah 👩‍⚕️
  - Dr. James 🧑‍⚕️
  - Dr. Priya 👩‍⚕️
- Rotating avatars during conversation
- Professional branding with stethoscope logo

## 🎨 Professional Design

- **Color Palette**: Teal (#14b8a6), Green (#16a34a), Amber (#f59e0b), Medical Red (#ef4444)
- **Gradients**: 14+ professional medical gradients
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile, tablet, and desktop optimized
- **Accessibility**: ARIA support, keyboard navigation

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PDF Generation**: html2canvas + jsPDF

### AI/Services
- **Primary AI**: DeepSeek API (3-5x faster responses)
- **Fallback AI**: Google Gemini API (gemini-2.5-flash)
- **Image Analysis**: Google Gemini Vision API
- **Speech**: Web Speech API (native browser)

### Deployment
- **Hosting**: Vercel (production-ready)
- **Database**: Local disease database (expandable to 200+ conditions)
- **Version Control**: Git + GitHub

## 📊 Disease Database

The platform includes a comprehensive local disease database with:
- **50+ medical conditions** with full details
- Each condition includes:
  - Specific symptoms
  - Causes and risk factors
  - Prescribed medicines with dosages
  - Home remedies
  - Severity levels (Mild, Moderate, Severe, Critical)
  - Red flag indicators for ER referral
  - Specialist recommendations

**Expandable to 200+ conditions** for comprehensive disease detection.

## 🚀 Live Demo

**Access the live platform**: https://arogya-platform-e3kn98it8-ipsitas-projects-00744d36.vercel.app

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- (Optional) Git for version control

### Quick Start

1. **Clone the repository**:
```bash
git clone https://github.com/YOUR_USERNAME/arogya-platform.git
cd arogya-platform
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
# Create .env.local file
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

4. **Start development server**:
```bash
npm run dev
```

5. **Build for production**:
```bash
npm run build
```

## 📁 Project Structure

```
arogya-platform/
├── src/
│   ├── components/
│   │   ├── ConsultationTabs/
│   │   │   ├── ChatConsultation.tsx      # AI Chatbot
│   │   │   ├── VoiceConsultation.tsx     # Voice Bot
│   │   │   ├── ImageConsultation.tsx     # Image Analysis
│   │   │   └── SymptomChecker.tsx        # Symptom Checker
│   │   ├── Dashboard.tsx                  # User Dashboard
│   │   ├── LandingPage.tsx               # Home Page
│   │   ├── LoginPage.tsx                 # Authentication
│   │   └── PrescriptionModal.tsx         # Prescription Download
│   ├── services/
│   │   ├── geminiService.ts              # Google Gemini API Integration
│   │   ├── diseaseDatabase.ts            # Disease Detection Logic
│   │   └── extendedDiseaseDatabase.ts    # Extended Disease Data
│   ├── context/
│   │   └── AuthContext.ts                # Authentication Context
│   ├── App.tsx                           # Main App Component
│   └── main.tsx                          # Entry Point
├── public/
├── tailwind.config.js                    # Tailwind CSS Configuration
├── vite.config.ts                        # Vite Configuration
├── vercel.json                           # Vercel Deployment Config
└── package.json                          # Dependencies
```

## 🔐 API Keys Setup

The platform uses two AI services:

### 1. **DeepSeek API** (Primary - Faster)
- Sign up at https://platform.deepseek.com
- Get your API key
- Add to `.env.local`: `VITE_DEEPSEEK_API_KEY=your_key`

### 2. **Google Gemini API** (Fallback & Image Analysis)
- Get API key from https://makersuite.google.com/app/apikey
- Add to `.env.local`: `VITE_GEMINI_API_KEY=your_key`

## 💡 Usage Examples

### Chat Consultation
1. Click "Start Consultation"
2. Select "Chat with Doctor"
3. Describe your symptoms
4. Answer diagnostic questions (2-5 questions)
5. Receive AI diagnosis and recommendations
6. Click "End Consultation" to download prescription

### Voice Consultation
1. Click "Start Consultation"
2. Select "Voice Consultation"
3. Click microphone and speak naturally
4. AI responds with voice and text
5. Download prescription when done

### Symptom Checker
1. Click "Symptom Checker"
2. Select multiple symptoms from the list
3. Click "Analyze Symptoms"
4. View:
   - Possible conditions
   - Specific medications with dosages
   - Home remedies
   - Emergency red flags

### Image Analysis
1. Click "Start Consultation"
2. Select "Image Analysis"
3. Upload a medical image
4. Get AI-powered diagnosis
5. View medicines and recommendations
6. Download prescription

## 🧪 Features Highlight

| Feature | Chat | Voice | Image | Symptom |
|---------|------|-------|-------|---------|
| AI Diagnosis | ✅ | ✅ | ✅ | ✅ |
| Doctor Avatars | ✅ | ✅ | ✅ | - |
| Medications | ✅ | ✅ | ✅ | ✅ |
| Home Remedies | ✅ | ✅ | ✅ | ✅ |
| Red Flags | ✅ | ✅ | ✅ | ✅ |
| Prescription Download | ✅ | ✅ | ✅ | - |
| Voice Input/Output | - | ✅ | - | - |
| Image Upload | - | - | ✅ | - |

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup and configuration
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview
- **[COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)** - Component documentation
- **[QUICKSTART.txt](./QUICKSTART.txt)** - Quick reference guide

## 🔄 Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel --prod --yes
```

3. **Your app will be live** at: `https://arogya-platform-xxx.vercel.app`

### Environment for Production
- Make sure API keys are set in Vercel environment variables
- `.vercelignore` excludes unnecessary Python files
- `vercel.json` configures public access and SPA routing

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Medical Disclaimer

**IMPORTANT**: Arogya is an AI-powered health information platform. It is NOT a substitute for professional medical diagnosis or treatment. Always consult with a qualified healthcare professional for medical concerns.

The recommendations provided are for informational purposes only and should not be considered as medical advice.

## 🆘 Support & Issues

- **Found a bug?** Open an [Issue](https://github.com/YOUR_USERNAME/arogya-platform/issues)
- **Have a suggestion?** Create a [Discussion](https://github.com/YOUR_USERNAME/arogya-platform/discussions)
- **Need help?** Check our [Documentation](./SETUP_GUIDE.md)

## 👥 Authors

- **Arogya Team** - Initial development and deployment

## 🎯 Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Real doctor integration
- [ ] Telemedicine consultation
- [ ] Appointment booking
- [ ] Medical records storage
- [ ] ML model improvements
- [ ] Multi-language support (10+ languages)
- [ ] Integration with healthcare systems

## 📞 Contact

For inquiries and support:
- Email: support@arogya.health
- Website: https://arogya-platform-e3kn98it8-ipsitas-projects-00744d36.vercel.app

---

## 📊 Project Statistics

- **Lines of Code**: 2,100+
- **React Components**: 8+
- **Medical Conditions**: 50+
- **Supported Symptoms**: 20+
- **Doctor Avatars**: 4
- **Color Gradients**: 14+
- **Animations**: 20+

---

**Made with ❤️ for better healthcare access**

⭐ If you find this project helpful, please give it a star!
