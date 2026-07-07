import {Storage} from "../DatabaseProvider";

export class AuthService {

    static async authenticate(ip: string, uuid: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            const clientByIp = await Storage.getInstance().Client.findOneBy({
                ip
            });
            let clientByToken = null;

            if (uuid != null) {
                const secretArr = uuid.split('-');
                const identifier: string = secretArr[0];
                clientByToken = await Storage.getInstance().Client.findOneBy({
                    identifier
                });
            }

            if (clientByIp == null && clientByToken == null) {
                resolve(false);
                return;
            }

            resolve(true);
        })
    }

}
