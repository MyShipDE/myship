import {Client} from '../modals/Client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import {Log} from "./helpers/Log";
import {Storage} from "../DatabaseProvider";

dotenv.config();

const get = async (secret: string, reqIp: string) => {

    const ip = reqIp.replace('::ffff:', '');
    const client = await Storage.getInstance().Client.findOneBy({ip});

    if (client != null) {
        return client;
    } else if (secret != null) {
        const secretArr = secret.split('-');
        const identifier: string = secretArr[0];
        return await Storage.getInstance().Client.findOneBy({identifier});
    }

    return null;
};

const getAll = async () => {
    return await Storage.getInstance().Client.find();
};

const login = async (token: string, secret: string, reqIp: string, clientInfo: any = null) => {
    const saltRounds = 10;
    const secretArr = secret.split('-');
    const identifier: string = secretArr[0];
    const ip = reqIp.replace('::ffff:', '');

    if (await Storage.getInstance().Client.findOneBy({identifier}) == null) {
        Log.debug('[USER-SERVICE] Token #' + token);
        const client = await Storage.getInstance().Client.findOneBy({token});

        if (client != null && client.secret == null) {

            Log.debug('[USER-SERVICE] Client was found by Token');

            // Generate Hash for AppID and store it in Database.
            client.secret = await bcrypt.hash(secret, saltRounds);

            // Set Identifier in Database
            client.identifier = identifier;

            await client.save();

            // Set Client Information like Device, OS and county etc.
            await setUserDetails(client.id, clientInfo);

            return true;

        }
    }
    return false;
};

const setUserDetails = async (clientId: number, clientInfo: any) => {
    if (clientInfo != null) {
        const client = await Storage.getInstance().Client.findOneBy({id: clientId});
        const info: any = clientInfo.info ?? null;
        const lang: any = clientInfo.lang ?? null;
        client.language = lang.value ?? null;
        client.platform = info.platform ?? null;
        client.osType = info.operatingSystem ?? null;
        client.osVersion = info.osVersion ?? null;
        client.name = info.name ?? null;
        client.model = info.model ?? null;
        client.manufacturer = info.manufacturer ?? null;
        await client.save();
    }
}

const create = async (token: string, comment: string, isAdmin: boolean = null) => {
    const temp = await Storage.getInstance().Client.findOneBy({token});
    if (temp == null) {
        const client = new Client();
        client.token = token;
        client.comment = comment;
        client.isAdmin = isAdmin;
        await client.save();
        return true;
    }
    return false;
};

const deleteClient = async (clientId: number, currentUserSecret: string) => {

    // Get current Client
    const secretArr = currentUserSecret.split('-');
    const identifier: string = secretArr[0];
    const currentClient = await Storage.getInstance().Client.findOneBy({identifier});

    const client = await Storage.getInstance().Client.findOneBy({id: clientId});
    if (currentClient.id !== clientId && client != null) {
        await client.remove();
        return true;
    }
    return false;
};

const generateString = (length: number): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export default {
    get,
    login,
    getAll,
    create,
    deleteClient
}
