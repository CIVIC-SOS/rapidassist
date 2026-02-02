# 🆘 RapidAssist - Emergency Response Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-10.7-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Quick Help When You Need It Most**

A comprehensive emergency response and civic issue reporting platform with real-time tracking, AI-powered analysis, and multi-agency coordination.

[Demo](#demo) • [Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture)

</div>

---

## 📖 Overview

RapidAssist is a modern emergency services platform designed to provide instant access to emergency services (Police, Ambulance, Fire), enable community issue reporting, and provide real-time status tracking. The platform connects citizens with emergency responders and local authorities seamlessly.

## ✨ Features

### 🚨 Emergency SOS System
- **One-tap SOS activation** with 7-second countdown
- **Automatic location sharing** using GPS
- **Multimedia evidence capture** - automatically captures 5 images + 7-second audio recording
- **Shake-to-activate** emergency alerts
- **Real-time Firebase sync** for instant responder notification
- **Emergency contact notification** system

### 🤖 AI-Powered Features
- **Gemini AI Integration** for civic issue analysis
- **Automatic issue categorization** from photos
- **AI-generated user health summaries** for emergency responders
- **Smart priority assessment** for reported issues

### 📍 Location Services
- **Interactive Leaflet maps** for precise location marking
- **Reverse geocoding** for address resolution
- **Real-time location tracking** during emergencies
- **Accuracy indicators** for GPS positioning

### 👮 Admin Control Centers
- **Police Control Center** (`/police-admin`)
- **Ambulance Control Center** (`/ambulance-admin`)
- **Fire Control Center** (`/fire-admin`)
- **Central Admin Dashboard** (`/admin`)
- **Real-time SOS monitoring** with live updates
- **Quick-view health summary popups**
- **One-click case assignment and status updates

### 🏘️ Community Reporting
- **Civic issue reporting** with photo evidence
- **AI-powered issue analysis** and categorization
- **Upvote/downvote system** for community prioritization
- **Status tracking** from submission to resolution
- **Multiple categories**: Roads, Street Lights, Water, Drainage, Garbage, Safety, Noise

### 👤 User Management
- **Mobile number registration** with OTP verification
- **Medical profile storage** (blood group, conditions, allergies)
- **Emergency contacts management**
- **User dashboard** for tracking submitted reports

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| ⚛️ **Frontend** | React 18, React Router DOM 6 |
| ⚡ **Build Tool** | Vite 5 |
| 🔥 **Backend** | Firebase Realtime Database |
| 🗄️ **Storage** | Supabase Storage, ImgBB |
| 🗺️ **Maps** | Leaflet, React-Leaflet |
| 🤖 **AI** | Google Gemini API |
| 🎨 **Styling** | Custom CSS with CSS Variables |

---

## 📁 Project Structure

```
rapidassist/
├── 📄 index.html              # Entry HTML file
├── 📦 package.json            # Dependencies & scripts
├── ⚙️ vite.config.js          # Vite configuration
├── 🌐 vercel.json             # Vercel deployment config
├── 📂 public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
└── 📂 src/
    ├── 🚀 main.jsx            # React entry point
    ├── 📱 App.jsx             # Main app with routing
    ├── 🔥 firebase.js         # Firebase configuration
    ├── 🗄️ supabase.js         # Supabase configuration
    ├── 📂 components/
    │   ├── 🎵 AudioEvidencePlayer/   # Audio playback for evidence
    │   ├── 🚨 EmergencyCard/         # Emergency service cards
    │   ├── 📍 Header/                # Navigation header
    │   ├── 🗺️ LocationMap/           # Leaflet map component
    │   ├── 🔐 LoginForm/             # Authentication form
    │   ├── 📝 RegistrationForm/      # User registration
    │   ├── 📋 ReportCard/            # Issue report display
    │   ├── 🆘 SOSButton/             # SOS activation button
    │   └── 📊 StatusTracker/         # Status timeline
    ├── 📂 context/
    │   ├── 🔒 AuthContext.jsx        # Authentication state
    │   ├── 📑 ReportsContext.jsx     # Reports & SOS state
    │   └── 🔔 ToastContext.jsx       # Notification system
    ├── 📂 pages/
    │   ├── 🏠 Home.jsx               # Landing page
    │   ├── 🔐 Login.jsx              # Login page
    │   ├── 📝 Register.jsx           # Registration page
    │   ├── 📊 Dashboard.jsx          # User dashboard
    │   ├── 🆘 SOS.jsx                # Emergency SOS page
    │   ├── 📋 ReportIssue.jsx        # Issue reporting
    │   ├── 🏘️ Community.jsx          # Community issues feed
    │   ├── 👤 UserProfile.jsx        # User profile management
    │   ├── 🛡️ AdminDashboard.jsx     # Central admin panel
    │   ├── 👮 PoliceAdmin.jsx        # Police control center
    │   ├── 🚑 AmbulanceAdmin.jsx     # Ambulance control center
    │   └── 🚒 FireAdmin.jsx          # Fire control center
    ├── 📂 styles/
    │   ├── 🎨 index.css              # Base styles
    │   └── ✨ enhanced.css           # Component styles
    └── 📂 utils/
        ├── 🤖 civicAnalyzer.js       # Gemini AI integration
        ├── 📡 sendingSOS.js          # SOS evidence capture
        └── ⚙️ constants.js           # App constants
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Supabase project (for audio storage)
- Gemini API key (for AI features)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rapidassist.git
   cd rapidassist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # AI Configuration
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 📱 Usage

### For Citizens

| Action | Description |
|--------|-------------|
| 🆘 **Emergency SOS** | Press the SOS button, select service type, and wait 7 seconds for automatic alert |
| 📸 **Report Issue** | Take a photo, AI analyzes and categorizes it, then submit |
| 🏘️ **Community** | Browse issues, upvote important ones, add your own posts |
| 👤 **Profile** | Manage medical info and emergency contacts |

### For Admins

| Login | Credentials |
|-------|-------------|
| 👮 Police | `police` / `police123` |
| 🚑 Ambulance | `ambulance` / `ambulance123` |
| 🚒 Fire | `fire` / `fire123` |
| 🛡️ General Admin | `admin` / `admin123` |

---

## 🔄 Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   👤 Citizen    │────▶│  📱 RapidAssist  │────▶│  🔥 Firebase    │
│                 │     │     Frontend      │     │  Realtime DB    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                │                         │
                                ▼                         ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │  🤖 Gemini AI    │     │  👮 Admin       │
                        │  Analysis        │     │  Dashboards     │
                        └──────────────────┘     └─────────────────┘
```

---

## 🎨 Key Components

### 🆘 SOS System Flow

1. User presses SOS button
2. 7-second countdown begins (cancelable)
3. Camera/microphone permissions requested
4. **Parallel capture**: 5 images + 7s audio recording
5. Media uploaded to ImgBB (images) + Supabase (audio)
6. Emergency data pushed to Firebase with:
   - Location (GPS coordinates + address)
   - User profile & medical info
   - AI-generated health summary
   - Emergency contacts
   - Evidence URLs
7. Real-time notification to admin dashboards
8. Admin can view, assign, and manage cases

### 🤖 AI Integration

- **Civic Issue Analysis**: Upload a photo → Gemini analyzes → Returns structured JSON with category, priority, description
- **User Health Summary**: Generates concise emergency summary from user's medical profile during registration

---

## 🔧 Configuration

### Firebase Rules (Example)
```json
{
  "rules": {
    "emergencies": {
      ".read": true,
      ".write": true
    },
    "reports": {
      ".read": true,
      ".write": true
    },
    "users": {
      "$uid": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### Supabase Storage Bucket
Create a bucket named `sos-recordings` with public access for audio evidence storage.

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

The `vercel.json` is pre-configured for SPA routing.

---

## 📊 Emergency Services

| Service | Number | Color | Use Case |
|---------|--------|-------|----------|
| 👮 Police | 100 | 🔵 Blue | Crime, accidents, security |
| 🚑 Ambulance | 108 | 🔴 Red | Medical emergencies |
| 🚒 Fire | 101 | 🟠 Orange | Fire, rescue operations |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Library
- [Firebase](https://firebase.google.com/) - Backend & Realtime Database
- [Leaflet](https://leafletjs.com/) - Interactive Maps
- [Google Gemini](https://ai.google.dev/) - AI Analysis
- [Supabase](https://supabase.com/) - Storage Solution

---

<div align="center">

**Made with ❤️ for INVENTO 2026**

🆘 *Your Safety, Our Priority* 🆘

</div>
