# Memory Assistant - Web App

Your personal memory assistant to help you remember where you placed things!

## 🎯 What Is This Project?

This is the **Web version** of Memory Assistant. It's built with:
- **React** - Popular JavaScript library for building user interfaces
- **TypeScript** - JavaScript with type safety (catches errors before runtime)
- **CSS3** - Modern styling matching the Android app

## 📁 Project Structure

Here's what each folder does:

```
memory-assistant-web/
├── public/                      # Static files served directly
│   ├── index.html              # Main HTML file
│   ├── manifest.json           # PWA (installable web app) config
│   └── favicon.ico             # Browser tab icon
├── src/                        # Source code (where we write our app)
│   ├── App.tsx                 # Main app component (like MainActivity.kt)
│   ├── App.css                 # Styles for the app
│   ├── index.tsx               # Entry point (loads React)
│   └── index.css               # Global styles
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## 🚀 How to Run

1. **Navigate to the project folder**
   ```bash
   cd /Users/Maverick/memory-assistant-web
   ```

2. **Install dependencies** (only needed once)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - Automatically opens at http://localhost:3000
   - If not, manually open that URL in Chrome or Firefox

5. **See changes in real-time**
   - Edit any file in src/
   - Save the file
   - Browser automatically refreshes!

## 📚 Key Concepts Explained

### What is React?
A JavaScript library for building user interfaces with reusable components. Think of components as LEGO blocks - you combine them to build your app.

### What is TypeScript?
JavaScript with types. It catches bugs before you run the code.

### What is JSX?
HTML-like syntax inside JavaScript. Makes it easy to describe what UI should look like.

### What is a Component?
A reusable piece of UI. Like a function that returns HTML.

## 🎨 Current Features (Step 1)

- ✅ Basic React app structure
- ✅ Hello World screen
- ✅ Custom styling matching Android app
- ✅ Responsive design (works on mobile & desktop)

## 🔧 Available Commands

| Command | What it does |
|---------|-------------|
| npm start | Start development server |
| npm test | Run tests |
| npm run build | Build for production |

## 📖 Next Steps

Next up: **Step 2 - Display a simple list of items** 🎯
