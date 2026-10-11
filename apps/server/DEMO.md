# Demo mode

`DEMO_MODE=true` turns the gateway into a **self-contained virtual vessel**: it
never actuates real hardware and simulates everything. Two uses:

- **Development** — exercise the full app without touching real lights, relays
  or consumers of an actual boat.
- **App-Store review / VM** — a gateway anyone can run (Docker/VM) with no real
  hardware, no external services and no API keys.

## Run it

Docker (recommended):

```bash
cd apps/server
docker compose -f docker-compose.demo.yml up --build
```

Or directly:

```bash
cd apps/server
cp .env.demo.example .env
npm install && npx tsc && npm start
```

Then in the app's onboarding, tap **"Demo ausprobieren"** (or enter the gateway
host). No PIN is required — a demo gateway authorises every device.

## What it does

- **No hardware.** Light/relay control runs through demo *actuators*
  (`services/DemoMode/actuators`): no HTTP/MQTT to real devices, but the virtual
  state still updates and the usual socket events fire, so the app behaves
  exactly as in real use. Hardware init/pollers (BridgeService, VE.Direct, modem,
  Bluetooth, Shelly/Tasmota polling) are skipped.
- **Simulated SignalK.** `DemoSignalKServer` serves a SignalK delta stream on
  `SIGNALK_PORT`; `DemoSimulator` advances a moving vessel + battery/wind/engine
  values every second. The gateway's own pipeline (cache → 4 s socket broadcast)
  and the app's direct `:3000` stream both consume it unchanged.
- **MQTT loop.** The simulator publishes Shelly status
  (`<bridge>/status/switch:0`) to the aedes broker, so the app's MQTT battery
  view is live too.
- **Seeded fleet.** On first run (empty DB) `DemoSeeder` creates bridges,
  consumers (incl. Ladegerät/Steckdosen/Herd), position lights, lights/groups/
  scenes, battery history and a demo alarm.
- **Neutralised externals.** SMTP, SMS, Cloud, WhisperAI and OS updates are
  no-ops; Apple WeatherKit returns canned data (no key needed).

All of this is a thin layer at defined seams — controllers, DB schema, caching,
socket broadcast and the REST API are unchanged.
