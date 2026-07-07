import net from 'net';
import request from "superagent";

export class SystemCheckService {

    static timeout: number = 3000;

    static async run(): Promise<void> {

        if (await this.check('1.1.1.1', 53)) {
            // SocketIO.emit('systemCheckSuccess', 'Die Internetverbindung konnte erfolgreich hergestellt werden!');
        } else {
            // SocketIO.emit('systemCheckFailed', 'Zurzeit besteht keine Verbindung mit dem Internet!');
        }

    }

    static async check(host: string, port: number): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const client = net.createConnection({
                port, host
            }, () => {
                client.destroy();
                resolve(true);
            });

            client.setTimeout(this.timeout, () => {
                client.destroy();
                resolve(false);
            });

            client.on('error', () => {
                client.destroy();
                resolve(false);
            });
        })
    }

    static async checkHttp(host: string): Promise<boolean> {
        try {
            await request
                .get(host)
                .set('accept', 'json');
            return true;
        } catch (e) {
            return false;
        }
    }

}
