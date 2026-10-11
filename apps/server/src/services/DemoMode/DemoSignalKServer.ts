import WebSocket from "ws";
import {Log} from "../helpers/Log";

export interface SignalKValue {
    path: string;
    value: any;
}

/**
 * A minimal SignalK-compatible delta stream on SIGNALK_PORT so the whole
 * existing pipeline (gateway SignalKHelper → cache → socket broadcast) AND the
 * Flutter client's direct :3000 stream work unchanged in demo mode.
 * Values are produced by {@link DemoSimulator}.
 */
export class DemoSignalKServer {
    private static _instance: DemoSignalKServer;

    static get Instance(): DemoSignalKServer {
        if (this._instance == null) this._instance = new DemoSignalKServer();
        return this._instance;
    }

    private wss: WebSocket.Server | null = null;
    private lastSnapshot: SignalKValue[] = [];
    private started = false;

    start(): void {
        if (this.started) return;
        const port = +process.env.SIGNALK_PORT || 3000;
        try {
            this.wss = new WebSocket.Server({port, path: '/signalk/v1/stream'});
            this.wss.on('connection', (ws: WebSocket) => {
                Log.info('[DEMO] SignalK client connected');
                // SignalK hello, then the current snapshot so the UI is immediately populated.
                ws.send(JSON.stringify({
                    name: 'myship-demo',
                    version: '1.0.0',
                    self: 'vessels.self',
                    roles: ['master', 'main'],
                }));
                if (this.lastSnapshot.length > 0) {
                    ws.send(JSON.stringify(this.toDelta(this.lastSnapshot)));
                }
            });
            this.wss.on('error', (e: Error) => Log.error('[DEMO] SignalK server error: ' + e.message));
            this.started = true;
            Log.info(`[DEMO] SignalK demo stream listening on :${port}/signalk/v1/stream`);
        } catch (e) {
            Log.error('[DEMO] Could not start SignalK demo stream: ' + e);
        }
    }

    /** Broadcasts the given values as a SignalK delta to all connected clients. */
    publish(values: SignalKValue[]): void {
        this.lastSnapshot = values;
        if (this.wss == null) return;
        const message = JSON.stringify(this.toDelta(values));
        this.wss.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    private toDelta(values: SignalKValue[]) {
        return {
            context: 'vessels.self',
            updates: [{
                source: {label: 'myship-demo'},
                timestamp: new Date().toISOString(),
                values: values.map(v => ({path: v.path, value: v.value})),
            }],
        };
    }
}
