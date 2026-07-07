import {SignalKHelper} from "../helpers/SignalKHelper";
import {SocketIO} from "./SocketIO";
import {SocketChannel} from "../../resources/SocketChannel";

export class WebSocketBroadcast {

    static schedule() {
        let data = SignalKHelper.getInstance().cachedData;

        data = data.filter(x => x.path.includes('electrical'));

        SocketIO.emit(SocketChannel.SignalKDataBroadcastObject, data);
    }

}