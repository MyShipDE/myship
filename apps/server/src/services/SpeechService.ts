import say from 'say';

export class SpeechService {

    private static _instance: SpeechService;

    async speech(message: string): Promise<void> {
        try {
            say.speak(message);
        } catch (e) {
            //
        }
    }

    static getInstance(): SpeechService {
        if (this._instance == null) {
            this._instance = new SpeechService();
        }
        return this._instance;
    }

}