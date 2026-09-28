# 嘎嘎香 (GaGa-Xiang)

A web, iOS, and Android ordering app for a family food business. Customers order
dishes for the next day before a 2PM (New York time) cutoff; the family cooks them
the next morning in a shared commercial kitchen and delivers every order in a
single morning run.

Built with [Expo](https://expo.dev) (React Native), [Expo Router](https://docs.expo.dev/router/introduction),
and TypeScript from a single codebase.

## Getting started

```bash
npm install
npx expo start
```

From the Expo CLI, press `i` for the iOS simulator, `a` for the Android emulator,
or `w` for the web.

## Scripts

| Command          | What it does                  |
| ---------------- | ----------------------------- |
| `npm start`      | Start the Expo dev server     |
| `npm run lint`   | Lint with ESLint              |
| `npx tsc --noEmit` | Typecheck                   |

## Project layout

- `src/app/` — screens and navigation (Expo Router file-based routes)
- `src/components/` — shared UI components
- `src/constants/` — design tokens (colors, spacing, fonts)
- `src/hooks/` — shared hooks
