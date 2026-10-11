# MyShip Client (Flutter)

Flutter rewrite of the MyShip client (replacing `apps/client`, Angular). Primary
drivers: **native RTSP** (via `media_kit`, no WebSocket relay) and **Raspberry Pi /
Linux embedded** deployment.

Target platforms: **iOS, iPad, macOS, Linux/Raspberry Pi**. (No Android/Windows/Web
for now.) The gateway server (`apps/server`) and its API are unchanged.

## Architecture

Follows the DiLog app's BE-request pattern (`dio` + `retrofit`), with three
MyShip-specific deviations: onboarding-configured server URL, device-UUID + PIN
auth, and a server-synced red night mode.

```
lib/
├── main.dart                 # MediaKit init, MultiProvider, router, blue/red theme
├── nav.dart                  # go_router (onboarding → app)
├── api/
│   ├── core/
│   │   ├── RestClient.dart        # shared @RestApi base + createDio()
│   │   ├── api_provider.dart      # owns Dio + domain API getters
│   │   └── interceptors/          # AuthInterceptor (UUID header + base URL), Logging
│   └── SystemApi.dart             # /test, /info, /login, /client, /nightmode
├── models/                   # json_serializable DTOs
├── services/
│   ├── connection_service.dart    # server URL + device UUID (onboarding state)
│   ├── auth_service.dart          # pairing (/login) + validation (/client)
│   ├── night_mode_service.dart    # vessel-wide blue↔red, server-synced
│   ├── socket_service.dart        # Socket.IO broadcast streams per channel
│   └── signalk_service.dart       # SignalK WS stream (port 3000)
├── pages/                    # onboarding, home, ship, instruments, battery,
│                             #   lights, position-lights, verbraucher, plotter,
│                             #   weather, cam, logbook (DiLog link), settings, alarms, lock
└── resources/colors.dart     # #3399FF day / #C32626 night
```

Realtime: `SocketService` (Socket.IO, per-channel broadcast streams, no duplicate
listeners on reconnect), `SignalKService` (WS stream on :3000 — note navigation
paths use a custom `position-lights.*` prefix with `navigation.*` fallback) and
`MqttService` (Shelly over ws:8883). Maps use `flutter_map` (OSM + OpenSeaMap);
RTSP uses `media_kit`; gauges use `syncfusion_flutter_gauges`. Errors are
normalised to `ApiException` by a dio `ErrorInterceptor`.

### Auth model

The client generates a stable device UUID once (format `<8>-<16>-<12>`), persisted
and sent as the `Authorization` header on every request — this is the credential.
Onboarding pairs it with the gateway via `POST /login {token: <PIN>}`; `GET /client`
(200) validates it. Optional `X-Gateway-Identifier` header for multi-gateway.

### Night mode

Not an OS dark theme: a vessel-wide red mode for night vision. Only the seed colour
switches blue→red; the layout is unchanged. State comes from `GET`/`PUT /nightmode`
and the `MyShipServer.night_mode.state.object` socket channel.

## Develop

```bash
flutter pub get
dart run build_runner build           # regenerate *.g.dart after model/API changes
flutter analyze
flutter test

flutter run -d macos                  # or: -d <ios device>, -d linux
flutter build macos --debug           # macOS requires deployment target 12.0 (media_kit)
```

The gateway runs over plain HTTP on the local boat network; ATS exceptions and the
macOS `network.client` entitlement are configured accordingly.
