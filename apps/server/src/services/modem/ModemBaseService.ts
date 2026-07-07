"use strict";

import { SerialPort, ReadlineParser } from 'serialport';
import {ModemCallbackHandler} from "./ModemCallbackHandler";
import {Log} from "../helpers/Log";
import {ModemResources} from "./ModemResources";
import {ModemConfiguration} from "./ModemConfiguration";

export class ModemBaseService {

    private readonly CallbackHandler = new ModemCallbackHandler();
    private readonly Configuration = new ModemConfiguration(this);
    private SerialPortInstance: SerialPort;

    private readonly DEFAULT_PORT_OPTIONS = {
        path: "/dev/ttyS0",
        baudRate: 115200,
    };

    init(): void {
        this.SerialPortInstance = new SerialPort(this.DEFAULT_PORT_OPTIONS);
        const parser = this.SerialPortInstance.pipe(new ReadlineParser({ delimiter: "\r\n" }));

        this.SerialPortInstance.on(ModemResources.events.error, this.CallbackHandler.handleError);

        this.SerialPortInstance.on(ModemResources.events.open, async () => {
            Log.info("Modem serial port opened");

            await this.Configuration.run();
        });

        parser.on(ModemResources.events.data, this.CallbackHandler.handleData);

        this.SerialPortInstance.open();
    }

    async sendCommand(cmd: string) {
        Log.debug(`Sending AT CMD: ${cmd}`);
        if (!this.SerialPortInstance.write(`${cmd}\r\n`)) {
            Log.error(`Error writing to serial port: ${cmd}`);
            return;
        }
        while (!this.CallbackHandler.receivedData) {
            await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
        }
        this.CallbackHandler.receivedData = false;
    }

}