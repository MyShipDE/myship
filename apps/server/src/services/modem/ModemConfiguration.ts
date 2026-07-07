import {ModemBaseService} from "./ModemBaseService";

export class ModemConfiguration {

    constructor(private readonly base: ModemBaseService) {
        //
    }

    async run() {
        await this.cancelPreviousCommands();
        await this.setGpsConfig();
    }

    async cancelPreviousCommands() {
        await this.base.sendCommand("\x1B");
    }

    async setGpsConfig() {
        await this.base.sendCommand("AT+CGPS=1");
        await this.base.sendCommand("AT+CGPSNMEAPORTCFG=3");
        await this.base.sendCommand("AT+CGPSINFOCFG=10,10"); // 10,31
    }

}