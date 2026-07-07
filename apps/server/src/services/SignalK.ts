// import skSDK from '@signalk/client'
// import Bonjour from 'bonjour'

export class SignalK {

    private static _instance: SignalK;

    static getInstance() {
        if (this._instance == null) this._instance = new SignalK();
        return this._instance;
    }
}
