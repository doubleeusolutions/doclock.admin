# DocLock — Medical Exam Preparation Mobile App

A production-quality medical exam preparation mobile application built with **React Native**, **Expo**, and **TypeScript**, inspired by **Material 3 Expressive** design.

---

## 📱 Features Implemented

- **Material 3 Expressive Design System**:
  - Light blue primary theme (`#4F8FF7`), soothing tonal surfaces (`#EEF6FF`, `#E5F1FF`), and high-contrast typography.
  - Highly rounded expressive shapes (18px, 24px, 28px, 999px).
  - Tonal elevation hierarchy (zero harsh drop shadows or artificial neumorphism).
  - React Native Reanimated spring physics with tactile tap response (`scale: 0.97 → 1`).
- **Complete Home Screen (5 Major Areas)**:
  1. **Expressive Header**: Left-aligned personalized greeting (`"Good morning, Alex 👋"`), exam countdown badge, and strictly a single user avatar in the top-right corner.
  2. **Category Pills**: Horizontally scrollable specialty filters with fluid spring animations.
  3. **Featured Carousel**: 1.1 card peek showcasing fluid, amorphous color blends (Blue → Cyan → Soft Violet) mimicking modern Google AI styling.
  4. **Quick Practice MCQ Section**:
     - Clinical vignette wrapped in a dedicated tonal container card.
     - Strictly left-aligned question and answer options.
     - High-contrast circular badges (A, B, C, D).
     - **Dynamic State Logic**: Primary "Answer →" button remains visually disabled and dimmed until an option is selected.
     - Instant animated clinical explanation upon submission with reset/retry support.
  5. **Material 3 Bottom Navigation**:
     - 4 destinations: **Home**, **Practice**, **Courses**, **Profile**.
     - Selected tab highlighted with an M3 blue tonal pill container and filled icon.
     - Placeholder routes configured and ready for expansion.

---

## 🛠️ Project Structure

```
app/
  _layout.tsx                     # Root layout (SafeArea, GestureHandler, StatusBar)
  index.tsx                       # Root entry redirecting to tabs
  (tabs)/
    _layout.tsx                   # Expo Router tab controller with M3 BottomNavigation
    index.tsx                     # Complete Home Screen
    practice.tsx                  # QBank placeholder route
    courses.tsx                   # Courses placeholder route
    profile.tsx                   # Profile placeholder route
components/
  home/
    HomeHeader.tsx                # Expressive header with single top-right avatar
    CategoryPills.tsx             # Horizontal specialty pills
    FeaturedCarousel.tsx          # 1.1 peek cards with amorphous gradient
    MCQCard.tsx                   # Quick Practice card with disabled->enabled logic
  navigation/
    BottomNavigation.tsx          # Material 3 Expressive 4-tab bar
  ui/
    Pill.tsx                      # Reanimated spring pill
    TonalSurface.tsx              # M3 elevation container
    GradientOrb.tsx               # Amorphous fluid mesh gradient
theme/
  colors.ts                       # Light blue M3 palette
  shapes.ts                       # Corner radius scale (18, 24, 28, 999)
  spacing.ts                      # 4, 8, 12, 16, 20, 24, 32
  typography.ts                   # Google Sans-inspired type scale
  motion.ts                       # Reanimated spring physics presets
data/
  homeData.ts                     # Categories, featured drill cards, clinical MCQ
hooks/
  useResponsive.ts                # Scalable layout and 1.1 carousel sizing
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

### 3. Run on Devices
- **Physical Device**: Scan the QR code in your terminal using the **Expo Go** app (Android) or the Camera app (iOS).
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal (macOS only).
- **Web Browser**: Press `w` in the terminal.
