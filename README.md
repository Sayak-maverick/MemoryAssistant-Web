# Memory Assistant - Web App

A comprehensive web application designed to help individuals with memory loss track and remember their personal items. Built with modern web technologies including React, TypeScript, IndexedDB, and Firebase.

## 🎯 Features

### Core Functionality
- ✅ **Item Management**: Add, edit, delete, and search items
- 📸 **Photo Capture**: Upload photos from your device
- 🤖 **AI Object Detection**: Automatic label suggestions using Google Cloud Vision API
- 🎙️ **Voice Notes**: Record voice notes with automatic transcription
- 🗣️ **Multi-language Support**: Speech-to-text in 15+ languages
- 📍 **GPS Location Tracking**: Save and display where items were last seen
- ☁️ **Cloud Sync**: Real-time synchronization across devices using Firebase Firestore
- 🔐 **User Authentication**: Secure login with Firebase Authentication
- 💾 **Offline-first**: Works offline with automatic sync when connection returns

### Technical Features
- Material Design 3 inspired UI with modern CSS
- IndexedDB for local browser storage
- Real-time updates with Firebase listeners
- Offline-first architecture
- Automatic cloud backup
- Responsive design (mobile & desktop)
- Progressive Web App (PWA) capabilities

## 🏗️ Tech Stack

- **Language**: TypeScript
- **UI Framework**: React 18
- **Styling**: CSS3 with modern features
- **Local Storage**: IndexedDB (via idb library)
- **Authentication**: Firebase Authentication
- **Cloud Storage**: Firebase Firestore
- **Image Handling**: HTML5 File API
- **AI Services**:
  - Google Cloud Vision API (Object Detection)
  - Google Cloud Speech-to-Text API (Voice Transcription)
- **Async Operations**: Promises + async/await
- **Architecture**: Component-based with service layer

## 📋 Prerequisites

1. **Node.js**: Version 16 or later
2. **npm**: Version 8 or later
3. **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest version)
4. **Firebase Project**: Set up at [Firebase Console](https://console.firebase.com)
5. **Google Cloud Project**: For Vision and Speech-to-Text APIs

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Sayak-maverick/MemoryAssistant-Web.git
cd memory-assistant-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.com)
2. Add a Web app to your Firebase project
3. Copy your Firebase configuration
4. Create `.env` file in the project root:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Enable Firebase Authentication (Email/Password)
6. Enable Cloud Firestore
7. Set Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Google Cloud APIs Setup

#### Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Cloud Vision API**
3. Enable **Cloud Speech-to-Text API**

#### Create Service Account
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Download the JSON key file
4. Add credentials to `.env`:

```env
REACT_APP_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
```

⚠️ **Security**: The `.env` file is already in `.gitignore`. Never commit API credentials!

### 5. Build and Run

**Development Mode:**
```bash
npm start
```
Opens at http://localhost:3000 with hot reload

**Production Build:**
```bash
npm run build
```
Creates optimized build in `build/` directory

**Serve Production Build:**
```bash
npm install -g serve
serve -s build
```

## 📁 Project Structure

```
memory-assistant-web/
├── public/
│   ├── index.html               # Main HTML file
│   ├── manifest.json            # PWA configuration
│   └── favicon.ico              # App icon
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── AddEditItemModal.tsx # Add/Edit item dialog
│   │   └── ItemCard.tsx         # Item display card
│   ├── database/
│   │   └── db.ts                # IndexedDB operations
│   ├── services/
│   │   ├── firebaseConfig.ts    # Firebase initialization
│   │   ├── authService.ts       # Authentication service
│   │   ├── firestoreService.ts  # Cloud sync service
│   │   ├── visionService.ts     # AI object detection
│   │   ├── audioService.ts      # Voice recording & transcription
│   │   └── locationService.ts   # GPS location tracking
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # App styles
│   ├── index.tsx                # App entry point
│   └── index.css                # Global styles
├── .env                         # Environment variables (git-ignored)
├── .gitignore
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md
```

## 🔑 Required Browser Permissions

The app requires the following browser permissions:

- **Camera/Microphone**: For photos and voice notes (requested when needed)
- **Geolocation**: For GPS location tracking (requested when needed)
- **Storage**: IndexedDB for local data (automatic, no prompt)

All permissions are requested at runtime with proper user explanations.

## 🎨 Key Features Explained

### Item Management
- Add items with name, description, and labels
- Edit existing items in modal dialog
- Delete with confirmation dialog
- Search and filter items
- Responsive grid layout

### Photo & AI Detection
- Upload photos from device
- AI automatically detects objects with >70% confidence
- Auto-suggests item names and labels
- Image preview and display
- Uses Google Cloud Vision API

### Voice Notes (15 Languages)
- Record audio using browser MediaRecorder API
- Automatic speech-to-text transcription
- Supports: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi, Russian, Dutch, Polish, Turkish, Vietnamese
- Automatic language detection
- Playback with HTML5 Audio
- Audio stored as base64 in IndexedDB

### GPS Location
- Captures current GPS coordinates using browser Geolocation API
- Reverse geocoding to human-readable address
- Shows: "123 Main St, New York, NY" or coordinates
- Uses browser's native geolocation

### Cloud Sync
- Automatic sync on add/update/delete
- Real-time updates from other devices
- Offline support with pending sync queue
- User-specific data isolation
- Firestore path: `users/{userId}/items/{itemId}`

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication**
   - [ ] Register new account
   - [ ] Login with existing account
   - [ ] Logout

2. **Item Operations**
   - [ ] Add new item
   - [ ] Edit item
   - [ ] Delete item
   - [ ] Search items

3. **Photo Features**
   - [ ] Upload photo
   - [ ] AI label detection
   - [ ] Photo display
   - [ ] Delete photo

4. **Voice Notes**
   - [ ] Record audio
   - [ ] Play audio
   - [ ] View transcription
   - [ ] Delete audio
   - [ ] Test multiple languages

5. **Location**
   - [ ] Add GPS location
   - [ ] View location name
   - [ ] Remove location

6. **Cloud Sync**
   - [ ] Create item on device 1
   - [ ] Verify sync on device 2
   - [ ] Update item on device 2
   - [ ] Verify update on device 1
   - [ ] Delete item on device 1
   - [ ] Verify deletion on device 2

7. **Offline Mode**
   - [ ] Disable internet (browser DevTools)
   - [ ] Add/edit items
   - [ ] Enable internet
   - [ ] Verify auto-sync

8. **Browser Compatibility**
   - [ ] Test on Chrome
   - [ ] Test on Firefox
   - [ ] Test on Safari
   - [ ] Test on Edge
   - [ ] Test on mobile browsers

## 🐛 Troubleshooting

### Build Errors

**Issue**: "Module not found" errors
- **Solution**: Run `npm install` to install all dependencies

**Issue**: ".env file not found"
- **Solution**: Create `.env` file with Firebase configuration (see Setup section)

### Runtime Errors

**Issue**: Camera/microphone not working
- **Solution**: Ensure browser permissions are granted. HTTPS required for camera/mic access.

**Issue**: Voice recording fails
- **Solution**: Check browser supports MediaRecorder API (Chrome, Firefox, Edge)

**Issue**: Cloud sync not working
- **Solution**:
  1. Verify Firebase Authentication is enabled
  2. Check Firestore rules allow user access
  3. Ensure internet connection
  4. Check browser console for errors

**Issue**: AI detection returns empty
- **Solution**:
  1. Verify Vision API is enabled in Google Cloud Console
  2. Check API key is correctly set in `.env`
  3. Ensure image has detectable objects

**Issue**: IndexedDB errors
- **Solution**:
  1. Check browser supports IndexedDB (all modern browsers)
  2. Clear browser data and try again
  3. Check browser storage quota not exceeded

## 💻 Browser Requirements

- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

**Required Features:**
- IndexedDB support
- ES6+ JavaScript
- MediaRecorder API (for voice notes)
- Geolocation API (for GPS)
- File API (for photos)

## 🔒 Security & Privacy

- All user data is encrypted in transit (HTTPS)
- Firebase Authentication for secure login
- User-specific Firestore rules prevent unauthorized access
- API credentials never committed to Git (.env in .gitignore)
- IndexedDB data protected by browser same-origin policy
- HTTPS required for camera/microphone access

## 🚦 Performance

- Offline-first architecture ensures instant UI updates
- Background sync doesn't block UI
- Images stored as data URLs in IndexedDB
- Efficient IndexedDB queries with indexes
- React optimizations (useMemo, useCallback)
- Code splitting and lazy loading ready
- Service Worker ready for PWA caching

## 📱 Progressive Web App (PWA)

The app includes PWA support:
- Installable on mobile devices
- Offline functionality
- App-like experience
- Configured in `public/manifest.json`

**To Install:**
1. Open app in mobile browser
2. Tap "Add to Home Screen"
3. Use like a native app!

## 📄 License

This project was built as a tutorial application with beginner-friendly comments and documentation.

## 🤝 Contributing

This is a tutorial project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase and Google Cloud Console settings
3. Ensure all dependencies are up to date
4. Check browser console for errors

## 🎓 Learning Resources

This codebase includes extensive comments explaining:
- TypeScript basics and syntax
- React fundamentals (hooks, state, effects)
- IndexedDB operations
- Firebase integration
- Promises and async/await
- Service layer pattern
- Component-based architecture

Perfect for learning modern web development!

## 🔄 Sync with Android App

This Web app syncs seamlessly with the Android version:
- Both use the same Firestore database structure
- Items created on Android appear on Web (and vice versa)
- Real-time synchronization across all devices
- Same user accounts work on both platforms

See the Android repository: [MemoryAssistant-Android](https://github.com/Sayak-maverick/MemoryAssistant-Android)

---

**Built with ❤️ using Claude Code**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
