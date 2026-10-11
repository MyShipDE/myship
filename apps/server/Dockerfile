# MyShip gateway image. Suitable for a demo gateway on a VM (DEMO_MODE=true).
FROM node:20-bookworm

# Native build deps for bcrypt / sqlite3 / serialport / bleno / noble. BLE and
# serial are unused in demo mode but the modules still compile on install.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libudev-dev libusb-1.0-0-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx tsc

# HTTP + MQTT(TCP) + MQTT(WS) + SignalK demo stream
EXPOSE 80 1883 8883 3000

CMD ["node", "dist/app.js"]
