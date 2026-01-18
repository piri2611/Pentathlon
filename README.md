# Pentathlon App

A modern React + TypeScript application with a futuristic design system.

## Features

- **Navbar**: Fixed navigation with logo, centered links (Bazar/Display) with vertical separator and active indicators
- **Bazar Flow**: School name form → 15-second buzzer → auto-navigate to Display
- **Display Page**: Responsive grid of 5 cards (column on mobile, grid on desktop)
- **LocalStorage Persistence**: Maintains state across page refreshes
- **Design System**: Outfit font, glass-card effects, neon-glow, gradient-text

## Setup

1. Install dependencies:
```bash
npm install
```

2. **IMPORTANT**: Place your buzzer sound file at `public/buzzer.mp3`

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Buzzer Sound

The buzzer functionality expects an audio file at `/public/buzzer.mp3`. 
- The sound will play for exactly 15 seconds
- After 15 seconds, it automatically stops and navigates to the Display page
- Clicking the buzzer again while playing will restart the sound

## State Persistence

The app uses localStorage to persist:
- `activePage`: Current active page (bazar/display)
- `bazarStep`: Current step in Bazar flow (form/buzzer/display)
- `schoolName`: Entered school name

This means refreshing the page will maintain your exact position in the app.

## Design Tokens

- **Fonts**: Outfit (primary), Kavivanar (fallback)
- **Classes**: glass-card, glass-card-hover, neon-glow, gradient-text
- **Theme**: Light futuristic with gradient backgrounds
- **Colors**: Blue-purple gradient palette with subtle glassmorphism
