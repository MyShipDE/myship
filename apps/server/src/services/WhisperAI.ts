import {Log} from "./helpers/Log";
import fs from "fs";
import WebSocket from 'ws';
import dotenv from "dotenv";
import {SocketIO} from "./socket.io/SocketIO";
import {AudioService} from "./VDR/AudioService";
import {SocketChannel} from "../resources/SocketChannel";

dotenv.config();

export class WhisperAI {

    static inProcess = false;

    static translate(filename: string): boolean {

        const fileArr = filename.split('.');
        if (fileArr == null || fileArr.length < 2) {
            return false;
        }

        if (this.inProcess) {
            return false;
        }

        const id = fileArr[0];
        const token = process.env.WHISPER_ENDPOINT_KEY;
        const socket = new WebSocket(`ws://${process.env.WHISPER_ENDPOINT_HOST}:${process.env.WHISPER_ENDPOINT_PORT}`);

        socket.addEventListener('open', async (event) => {
            this.inProcess = true;
            const file = fs.readFileSync(`${__dirname}/../../storage/audio/${filename}`);
            socket.send(token);
            socket.send(file);
            SocketIO.emit(SocketChannel.WhisperServiceStateObject, true);
        });

        socket.addEventListener('message', async (event) => {
            const message = event.data + "";
            const result: IWhisperResult = JSON.parse(message);
            if (result.state === "Done") {
                this.inProcess = false;
                SocketIO.emit(SocketChannel.WhisperServiceStateObject, result);
                SocketIO.emit(SocketChannel.WhisperServiceResultObject, result);
                await AudioService.saveMessage(+id, result.message);
                fs.unlinkSync(`${__dirname}/../../storage/audio/${filename}`)
            } else {
                Log.debug(result.state);
            }
        });

        return true;
    }

}

interface IWhisperResult {
    state: string,
    message: string
}
