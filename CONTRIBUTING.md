# Contributing to Tarots OS

First off, thank you for considering contributing to Tarots OS! 💜

It's people like you that make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue or assessing your patches and features.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Asset Hydration](#asset-hydration-important)
- [Development Workflow & Quality Control](#development-workflow--quality-control)
  - [Linting & Formatting](#linting--formatting)
  - [Pre-commit Hooks (Husky)](#pre-commit-hooks-husky)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Coding Standards](#coding-standards)
  - [Style Guide](#style-guide)
  - [Commit Messages](#commit-messages)

## Code of Conduct

This project and everyone participating in it is governed by a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- **Node.js** (LTS version recommended)
- **npm** or **yarn**
- **Expo CLI** (via `npx`)
- An **OpenRouter** or **Gemini** API Key (for testing AI features)

### Installation

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR-USERNAME/tarots-os.git
    cd tarots-os
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
    _Note: This will automatically install Husky git hooks via the `prepare` script._

### Asset Hydration (Important) ⚠️

To respect copyright and keep the repository light, high-resolution Tarot card images are **not** included in the source code. You must provide your own images to run the app locally.

1.  Create a folder at `assets/rider-waite/`.
2.  Place your Rider Waite Smith deck images in this folder.
    - **Naming Convention**:
      - Majors: `maj_00.jpg` (The Fool) to `maj_21.jpg` (The World).
      - Suits: `wands_01.jpg` (Ace) to `wands_14.jpg` (King). Repeat for `cups`, `swords`, `pentacles`.
      - Back: `back.jpg`.
3.  Run the generation script to create the necessary JSON data and TypeScript mappings:
    ```bash
    node scripts/generate-deck.js rider-waite
    ```

**Note:** If you skip this step, the app will crash upon compilation because `deckRegistry.ts` cannot find the generated files.

## Development Workflow & Quality Control

We use a strict set of tools to ensure code quality and consistency across the project.

### Linting & Formatting

We use **ESLint** for code quality, **Prettier** for formatting, and **TypeScript** for static type checking. We also use `@trivago/prettier-plugin-sort-imports` to enforce consistent import ordering.

You can run these checks manually using the following npm scripts:

- `npm run format`: Auto-formats code using Prettier.
- `npm run lint`: Checks for linting errors.
- `npm run type-check`: Runs the TypeScript compiler to check for type errors.
- `npm run check-all`: Runs all the above checks in sequence. **Recommended before pushing.**

### Pre-commit Hooks (Husky)

We use **Husky** and **lint-staged** to automatically verify your code before you commit.
When you run `git commit`, the following checks are triggered on staged files:

1.  **Prettier**: Files are formatted automatically.
2.  **ESLint**: Code is checked for errors and auto-fixed where possible.
3.  **TypeScript**: `tsc --noEmit` is run to ensure no type errors are introduced.

**If any of these checks fail, the commit will be aborted.** Please fix the errors and try again.

## How to Contribute

### Reporting Bugs

Bugs are tracked as GitHub issues. When filing an issue, explain the problem and include additional details to help maintainers reproduce the problem:

- Use a clear and descriptive title.
- Describe the exact steps which reproduce the problem.
- Provide specific examples to demonstrate the steps.
- Describe the behavior you observed after following the steps.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

- Use a clear and descriptive title for the issue to identify the suggestion.
- Provide a step-by-step description of the suggested enhancement.
- Explain why this enhancement would be useful to most users.

### Pull Requests

1.  **Create a branch** from `main`:
    ```bash
    git checkout -b feature/amazing-feature
    ```
2.  **Make your changes**.
3.  **Run checks locally**:
    ```bash
    npm run check-all
    ```
4.  **Commit your changes** (Husky will run validation).
5.  **Push** to your fork:
    ```bash
    git push origin feature/amazing-feature
    ```
6.  Open a **Pull Request** on the original repository.
7.  Describe your changes clearly in the PR description. Link any relevant issues (e.g., "Closes #12").

## Coding Standards

### Style Guide

- **Language:** TypeScript. We use `Strict Mode`. Please do not use `any` unless absolutely necessary.
- **State Management:** We use **Zustand**. Avoid using React Context for high-frequency global state updates.
- **Styling:** We use **React Native Paper**.
  - Do not hardcode hex colors (e.g., `#FFFFFF`).
  - Always use the `theme` object (e.g., `theme.colors.primary`) to ensure Dark Mode compatibility.
- **Components:** Prefer functional components with Hooks.
- **Architecture:** Follow the feature-based folder structure (`src/features/...`).

### Commit Messages

We follow the **Conventional Commits** specification. This allows us to automatically generate changelogs.

Format: `<type>(<scope>): <subject>`

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `chore`: Changes to the build process or auxiliary tools

**Examples:**

- `feat(history): add search functionality to reading journal`
- `fix(ai): handle api timeout errors gracefully`
- `docs: update contributing guidelines`
- `chore: configure husky pre-commit hooks`

---

Thank you for contributing to Tarots OS! 🔮
