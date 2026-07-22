---
title: "Getting Started"
description: "Setting up gcode-core-events locally."
---

# Quick Start

Welcome to the **gcode-core-events** documentation!

## Prerequisites
- Node.js (v18+)
- Oracle Cloud Infrastructure (OCI) Credentials
- Google OAuth API Keys

## Environment Setup
Copy the `.env.example` file to `.env.local` and fill in the dummy values for your API keys.

```bash
cp .env.example .env.local
```

## Running the Development Server
Install dependencies and start the Next.js App Router server:
```bash
npm install
npm run dev
```

## Component Library
We use **Storybook** for our component library. Stories are stored in `.storybook/stories/` mirroring our atomic design structure.

To start Storybook:
```bash
npm run storybook
```
