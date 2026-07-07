import fs from 'fs';
import path from 'path';
import {Log} from "./helpers/Log";
import {AuthService} from "./AuthService";
import {SocketIO} from "./socket.io/SocketIO";
import {WhisperAI} from "./WhisperAI";
import {VoiceEntry} from "../modals/VoiceEntry";
import {SocketChannel} from "../resources/SocketChannel";

// tslint:disable-next-line:no-var-requires
const AudioRecorder = require('node-audiorecorder');

export class AudioRecorderService {

    private static _audioRecorder: any;
    public static _state = false;
    private static readonly DIRECTORY = __dirname + '/../../storage/audio';
    private static path: string = null;
    private static filename: string = null;
    private static voiceEntry: VoiceEntry = null;

    static prepare(): AuthService {
        AudioRecorderService._audioRecorder = new AudioRecorder({
            program: `sox`,
            silence: 0
        }, console);

        AudioRecorderService._audioRecorder.on('error', () => {
            Log.error('Recording error.');
        });
        AudioRecorderService._audioRecorder.on('end', () => {
            Log.debug('Recording ended.');
        });

        return this;
    }

    static async start(): Promise<string> {
        this.voiceEntry = await (new VoiceEntry().save());
        this.filename = this.voiceEntry.id + '.wav';
        this.path = path.join(
            this.DIRECTORY,
            this.filename
        );
        Log.debug('Writing new recording file at:' + this.path);

        const fileStream = fs.createWriteStream(this.path, {encoding: 'binary'});
        this._state = true;

        SocketIO.emit(SocketChannel.AudioRecordStateObject, true);

        AudioRecorderService._audioRecorder.start().stream().pipe(fileStream);

        return this.path;
    }

    static stop(): void {
        AudioRecorderService._audioRecorder.stop();
        this._state = false;
        SocketIO.emit(SocketChannel.AudioRecordStateObject, false);
        WhisperAI.translate(this.filename);
    }

}
