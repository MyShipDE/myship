# MyShip 🚢

## Main Sponsor

<a href="https://dilog.page">
  <img src="https://dilog.page/assets/images/icons/logo.webp" alt="DiLog" height="80">
</a>

**[DiLog](https://dilog.page)** — the digital logbook for maritime and land-based
adventures. DiLog automatically tracks and archives your routes, lets you add
diary entries by voice, organise photos and videos, and share your journeys with
others. Combining dedicated software with a hardware data logger for seamless
position and vehicle-parameter tracking, it's built for sailors, boat owners and
camper travellers who want to preserve their travel memories and maintenance
records.

## The All-in-One System for Your Boat

MyShip is a comprehensive open-source boat management system that puts complete
control of your vessel at your fingertips. Whether you're monitoring power
consumption, controlling onboard devices, navigating waterways, or managing boat
systems, MyShip provides an integrated solution for modern boating.

## Monorepo layout

This repository is an [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)
monorepo containing the two main projects:

```
myship/
├── apps/
│   ├── server/   # Node.js / TypeScript gateway (SignalK, MQTT, REST API, VDR)
│   └── client/   # Angular app — Web, iOS (Capacitor) and Desktop (Electron)
├── docs/         # Design assets, REST API Postman collection, integrations
├── LICENSE       # GNU GPL v3
└── package.json  # Workspace root
```

| Project | Path | Stack |
|---|---|---|
| **Server** (gateway) | [`apps/server`](apps/server) | Node.js, TypeScript, Express, SignalK, MQTT (aedes), TypeORM |
| **Client** | [`apps/client`](apps/client) | Angular 18, Capacitor (iOS), Electron (Desktop) |

## Getting started

```bash
# Install all workspace dependencies from the repo root
npm install

# Server (gateway)
npm run server:start

# Client (Angular dev server on http://localhost:4200)
npm run client:start
npm run client:build
```

Each app is configured via a local `.env` file. Copy the provided templates and
fill in your own values:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/client/electron/deploy/.env.example apps/client/electron/deploy/.env
```

## Configuration & secrets

**Never commit secrets.** All credentials (API keys, tokens, database and SMTP
logins, signing keys such as the Apple WeatherKit `*.p8`, and the server's
`storage/` runtime data) are excluded via [`.gitignore`](.gitignore). Only
`*.example` templates belong in the repository.

## License

Licensed under the [GNU General Public License v3.0](LICENSE).
