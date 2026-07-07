import {Storage} from "../../DatabaseProvider";

export class SettingsHelper {

    static async Get(identifier: string) {
        return await Storage.getInstance().Setup.findOneBy({name: identifier});
    }

}
