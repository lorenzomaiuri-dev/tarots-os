# 🌌 Tarots OS: The Mystical Tarot Journal

<div align="center">
  <img src="./assets/icon.png" alt="Tarots OS Logo" width="120" height="120" />
  <br />
  
  [![MIT License](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB.svg)](https://reactnative.dev/)
  [![State Management](https://img.shields.io/badge/State-Zustand-orange.svg)](https://github.com/pmndrs/zustand)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

  <p align="center">
    <b>A sacred space for reflection, powered by advanced AI and Glassmorphism.</b>
    <br />
    <i>Bridging ancient wisdom with modern software architecture.</i>
  </p>
</div>

---

**Tarots OS** is a premium, privacy-focused Tarot journal. It transforms the smartphone into a digital altar, offering a sacred space for daily reflection powered by introspection-tuned AI interpretations and a cutting-edge Glassmorphic interface.

## ✨ Design Philosophy: "Liquid Glass"

Tarots OS follows a **"Ritualistic UX"** approach. Every interaction is designed to feel weighty and meaningful.

- **💎 iOS-esque Glassmorphism:** Deep utilization of `expo-blur` and multi-layered translucency creates a sense of depth and ethereal beauty.
- **📳 Tactile Feedback:** Full integration of `expo-haptics` provides physical "clinks" during card flips and "pulses" during cosmic RNG draws.
- **🌗 Immersive Atmosphere:** Dynamic light/dark mode support with semantic color mapping ensures accessibility while maintaining the mystical vibe.
- **🌊 Micro-interactions:** Fluid layout transitions using `LayoutAnimation` and shared element logic for an organic feel.

## 📸 Experience

|                 **Daily Ritual**                 |                   **Deck Gallery**                   |                  **The Spread**                   |                    **AI Gnosis**                     |
| :----------------------------------------------: | :--------------------------------------------------: | :-----------------------------------------------: | :--------------------------------------------------: |
| <img src="./screenshots/home.png" width="200" /> | <img src="./screenshots/explorer.png" width="200" /> | <img src="./screenshots/table.png" width="200" /> | <img src="./screenshots/insights.png" width="200" /> |

> _Imagine a GIF here showing the card flip animation_

## 📲 Availability

Tarots OS is currently in active development. We are preparing for a public release on all major open platforms.

<div align="center">
  
  <img src="https://img.shields.io/badge/Google_Play-Coming_Soon-414141?style=for-the-badge&logo=google-play&logoColor=white" alt="Google Play Coming Soon" height="40" />
  
  <img src="https://img.shields.io/badge/App_Store-Coming_Soon-0D96F6?style=for-the-badge&logo=app-store&logoColor=white" alt="App Store Coming Soon" height="40" />

  <img src="https://img.shields.io/badge/F_Droid-Coming_Soon-1976D2?style=for-the-badge&logo=f-droid&logoColor=white" alt="F-Droid Coming Soon" height="40" />

</div>

## 🚀 Key Features

- 🔮 **AI-Powered Insights:** Uses advanced LLMs (via OpenRouter) with custom "System Prompts" to provide psychological and evolutionary interpretations, avoiding fatalistic predictions.
- 📖 **The Chronicles:** A local-first journal to track your spiritual journey over time, searchable by keywords, suits, or feelings.
- 🃏 **Deck Explorer:** A "Sacred Library" to study the visual and esoteric details of the Rider Waite Smith deck.
- 🛠️ **Customizable Rituals:** Toggle between Full Deck and Major Arcana, handle reversals, and set personal intentions.
- 🔒 **Privacy First:** Your journal lives on your device (AsyncStorage). No servers, no tracking. JSON export available for your data sovereignty.

## 🛠 Technical Architecture

Engineered for scalability, maintainability, and performance.

### Core Stack

- **Framework:** React Native via [Expo SDK 50+](https://expo.dev/)
- **Language:** TypeScript (Strict Mode)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) + AsyncStorage for persistence.
- **UI Framework:** [React Native Paper](https://callstack.github.io/react-native-paper/) (Heavily customized theme).
- **AI Layer:** Agnostic Service Layer connecting to OpenRouter/OpenAI Compatible.

### Project Structure

A Data-Driven approach allows for easy addition of new decks and spreads without touching the core logic.

```text
src/
├── api/             # AI Prompt Builders & Clients
├── components/      # Atomic UI (GlassSurface, CardFlip)
├── data/            # JSON Definitions (Spreads, Decks)
├── features/        # Screen Logic (Reading, History, Settings)
├── hooks/           # Business Logic (useDailyDraw, useInterpretation)
├── services/        # RNG Engine, Storage, DeckRegistry
├── store/           # Zustand Stores
└── types/           # TypeScript Interfaces
```

---

## ⚙️ Installation & Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/lorenzomaiuri-dev/tarots-os.git
    cd tarots-os
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Prepare Assets (Copyright Compliance)**
    _High-res Rider Waite images are not included in the repo._
    - Place your images in `assets/rider-waite/` (format: `maj_00.jpg`, `wands_01.jpg`...).
    - Run the hydration script:

    ```bash
    node scripts/generate-deck.js rider-waite
    ```

4.  **Run the App**

    ```bash
    npx expo start
    ```

5.  **Ignition**
    Follow the in-app Onboarding to insert your API Key.

## 🗺️ Roadmap

- [x] **v1.0**: Core Engine, History, AI Integration
- [ ] **v1.1**: Home Screen Widgets & Notifications
- [ ] **v1.2**: Biometric Lock (FaceID) for Journal Privacy
- [ ] **v2.0**: Multi-deck comparison & "Study Mode"

## 🤝 Contribution

Contributions are welcome. Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🌌 Acknowledgments

- **A.E. Waite & Pamela Colman Smith** for the timeless imagery.
- **OpenRouter** for democratizing access to LLMs.
- The **React Native** community for the tools to build beautiful software.

---

<p align="center">
  <i>Crafted with 💜 and Intention.</i>
</p>
