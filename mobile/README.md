# Mobile app

React Native (Expo, managed workflow) Android client for the Project Management System. It follows `docs/API.md`, `docs/VALIDATION.md`, `docs/SECURITY.md`, `docs/DESIGN.md` and `docs/frontend.md`, and uses the same backend API as the web app.

Users can register, log in, see the dashboard, browse their projects (read-only) and manage the tasks inside them. Creating, editing and deleting projects is web-only by design.

## Setup

```bash
cp .env.example .env   # set EXPO_PUBLIC_API_URL (backend base URL including /api)
npm install
npx expo start         # scan the QR code with Expo Go, or press "a" for an Android emulator
```

`EXPO_PUBLIC_API_URL` is the only configuration. Expo embeds `EXPO_PUBLIC_*` values in the app bundle, so it must never contain secrets. Restart `npx expo start` after changing `.env`.

| Where the app runs | `EXPO_PUBLIC_API_URL` |
|---|---|
| Android emulator on the same computer as the backend | `http://10.0.2.2:4000/api` (`10.0.2.2` is the host computer) |
| Physical phone with Expo Go | `http://<computer's LAN IP>:4000/api` |
| Release APK | `https://<deployed backend>/api` |

For a physical phone: the phone and computer must be on the same Wi-Fi network, the backend must be running (`npm run dev` in `backend/`), and the computer's firewall must allow incoming connections to Node on port 4000. Find the LAN IP with `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows). The backend's CORS list does not need to change: native apps send no `Origin` header.

Release builds of Android block plain `http://`, so a release APK must point at the HTTPS backend.

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | Expo development server |
| `npm run android` | Development server, opened on a connected device or emulator |
| `npm run lint` | Lint with ESLint (`eslint-config-expo`) |
| `npm run doctor` | Check the project with Expo Doctor |

## Authentication

The JWT is stored only in `expo-secure-store` (Android Keystore) and sent as `Authorization: Bearer <token>` by the single API client (`src/lib/apiClient.js`). It is never written to AsyncStorage, files or logs. On launch the saved session is checked with `GET /api/auth/me`; if the server rejects the token it is deleted and the login screen explains why. Expired-token requests are never retried. If the server cannot be reached, the token is kept and the app offers "Try again".

## Project structure

```
src/
  app/          Expo Router screens: (auth) login/register, (app) tabs, project details, task forms
  components/   Shared UI (buttons, fields, state views, toast, offline banner)
  config/       Validated environment and navigation options
  features/     auth, dashboard, projects, tasks: API hooks, schemas and feature components
  lib/          API client, error mapping, query client, dates, token storage
  theme.js      Colours, spacing and fonts from docs/DESIGN.md
```

## Building an APK (after the backend is deployed)

`eas.json` defines a `preview` profile that produces an installable APK and a `production` profile that produces an app bundle. The API URL is supplied per EAS environment, not committed:

```bash
npm install -g eas-cli
eas login
eas init                                   # links the project to your Expo account
eas env:create --environment preview --name EXPO_PUBLIC_API_URL --value https://<deployed backend>/api --visibility plaintext
eas build --platform android --profile preview
```

EAS prints a download link for the APK when the build finishes.
