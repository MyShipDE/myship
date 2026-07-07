import {Server} from 'socket.io';
import {Log} from "../helpers/Log";
import {Message} from "../../resources/Message";
import {SocketChannel} from "../../resources/SocketChannel";

export class SocketIO {

    static io: any;

    static Prepare(server: any): Promise<void> {
        return new Promise<void>(resolve => {
            SocketIO.io = new Server(server, {
                cors: {
                    origin: "*",
                },
            });

            SocketIO.io.on("connection", (socket: any) => {
                Log.debug(Message.WS_CLIENT_CONNECTED + socket.id);
            });

            resolve();
        });
    }

    static emit(channel: SocketChannel, msg: any): void {
        try {
            Log.debug('[WebSocket] Emit new Message to Channel: ' + channel);
            SocketIO.io.emit(channel, msg);
        } catch (e) {
            Log.error('[SOCKET.IO] Could not emit to Channel: ' + channel);
        }
    }

}
