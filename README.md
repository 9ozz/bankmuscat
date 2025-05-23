# 💸 BankMuscat React Native App
Welcome to the BankMuscat mobile app repository! This project is a modern, full-featured React Native application for managing your finances, wallets, and transactions. Built with Expo, Firebase, and a beautiful UI. 🚀

## 📦 Features
- 🔐 Authentication (Login/Register)
- 👛 Wallet management
- 💳 Transaction tracking
- 📊 Statistics & analytics
- 🖼️ Profile & image upload
- 🌙 Modern, responsive UI
## 🛠️ Requirements
- Node.js (v16 or newer recommended)
- npm or yarn
- Expo CLI
- Git
## 🚀 Getting Started
### 1. Clone the Repository
```
git clone https://github.com/
9ozz/bankmuscat.git
cd bankmuscat/bankmuscat
```
### 2. Install Dependencies
```
npm install
# or
yarn install
```
### 3. Set Up Environment Variables
- Copy .env.example to .env and fill in your Firebase and other API keys.
### 4. Start the App
```
npx expo start
```
- Scan the QR code with the Expo Go app on your phone 📱
- Or run on an emulator: a (Android) or i (iOS)
## 🏗️ Project Structure
```
bankmuscat/
  app/           # Main app code 
  (screens, modals, tabs)
  components/    # Reusable UI 
  components
  constants/     # Theme, colors, 
  spacing, data
  services/      # API and Firebase 
  services
  hooks/         # Custom React hooks
  contexts/      # React Context 
  providers
  assets/        # Images, fonts
  utils/         # Utility functions
```
## 🔑 Firebase Setup
1. Create a Firebase project at Firebase Console
2. Enable Authentication, Firestore, and Storage
3. Add your Firebase config to constants/firebase.ts or your .env file
## 🧑‍💻 Useful Scripts
- npm run start — Start Expo dev server
- npm run android — Run on Android emulator
- npm run ios — Run on iOS simulator
- npm run web — Run on web browser
## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the MIT License.

## 🙋 FAQ
- How do I reset the project?
  ```
  node scripts/reset-project.js
  ```
- Where do I add new screens? Add new files in app/(tabs)/ or app/(modals)/ .
- How do I update the theme? Edit constants/theme.ts .
## 🌟 Happy Coding!
If you like this project, give it a ⭐ on GitHub!
