# Buddy Script — Frontend

A social networking web application built with **Next.js 16** and **TypeScript**.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **Font:** Poppins (via `next/font/google`)
- **Styling:** Custom CSS (`public/assets/css/`)

## Project Structure

```
app/
├── (auth)/
│   ├── login/          # Login page
│   └── registration/   # Registration page
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx            # Home / Feed page
public/
└── assets/             # Images, fonts, CSS, JS
```

## Pages

| Route           | Description       |
|-----------------|-------------------|
| `/`             | Main feed page    |
| `/login`        | User login        |
| `/registration` | User registration |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
