import {LogbookManualInputType} from "../modals/LogbookManualInputType";
import {Storage} from "../DatabaseProvider";

export class LogbookService {

    static async createTypesIfNotExists(): Promise<void> {
        await this.createType("Wetter");
        await this.createType("Antrieb");
        await this.createType("Sicht");
        await this.createType("Wellenhöhe");
    }

    private static async createType(name: string) {
        if (await Storage.getInstance().LogbookManualInputType.findOneBy(({name})) == null) {
            const type = new LogbookManualInputType();
            type.name = name;
            await type.save();
        }
    }

}
