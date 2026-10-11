/**
 * Central switch for the demo mode. When DEMO_MODE=true the gateway never
 * actuates real hardware and simulates a virtual vessel instead — for
 * development and for a self-contained gateway on a VM (App-Store review).
 *
 * Kept standalone (reads env directly) to avoid importing app.ts into
 * low-level services and creating import cycles.
 */
export class DemoMode {
    static get active(): boolean {
        return process.env.DEMO_MODE != null
            && process.env.DEMO_MODE.toLowerCase() === 'true';
    }
}
