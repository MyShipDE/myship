import {Log} from "./helpers/Log";
import {SignalKHelper} from "./helpers/SignalKHelper";
import {SocketIO} from "./socket.io/SocketIO";

// tslint:disable-next-line:no-var-requires
const VEDirect = require('@signalk/vedirect-serial-usb/standalone');

export class VeDirectService {

    static lastUpdate: number = 0;

    static init() {
        Log.info('VE-Direct - Initializing...');

        try {
            const consumer = new VEDirect({
                device: process.env.VE_DIRECT_SERIAL ?? '/dev/ttyUSB0',
                ignoreChecksum: true,
                mainBatt: 'main',
                auxBatt: 'starter',
                solar: 'solar',
            })

            consumer.on('delta', async (delta: any) => {
                this.lastUpdate = Date.now();
                for (const update of delta.updates) {
                    for (const data of update.values) {
                        // Log.debug('VE-Direct - ' + data.path + ': ' + data.value);
                        await SignalKHelper.getInstance().ensureDataIsCached(data.path, data.value);
                    }
                }
            });

            consumer.start();

            setInterval(() => {
                if (this.lastUpdate < Date.now() - 1000 * 60 * 5) {
                    Log.warn('VE-Direct - No data received in the last 5 minutes');
                    try {
                        consumer.stop();
                    } finally {
                        consumer.start();
                    }
                }
            }, 1000 * 20);
        } catch (e) {
            Log.warn('VE-Direct - Error: ' + e.message);
        }
    }

}