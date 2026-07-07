import {exec} from 'child_process';
import {Log} from "./helpers/Log";
import {Message} from "../resources/Message";
import {SocketIO} from "./socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class UpdateService {

    private static _instance: UpdateService;

    constructor() {
        //
    }

    static get Instance(): UpdateService {
        if (this._instance == null) this._instance = new UpdateService();
        return this._instance;
    }

    updatePackages(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            exec("apt-get update && apt-get upgrade -y",
                (error, stdout, stderr) => {
                    if (error) {
                        Log.debug(Message.FAILED_UPDATE_LINUX_PACKAGES);
                        SocketIO.emit(SocketChannel.SystemUpdateLogObject, Message.FAILED_UPDATE_LINUX_PACKAGES);
                        resolve(false);
                        return;
                    }
                    if (stderr) {
                        Log.debug(Message.FAILED_UPDATE_LINUX_PACKAGES);
                        SocketIO.emit(SocketChannel.SystemUpdateLogObject, Message.FAILED_UPDATE_LINUX_PACKAGES);
                        resolve(false);
                        return;
                    }
                    Log.debug(Message.SUCCESS_UPDATE_LINUX_PACKAGES);
                    SocketIO.emit(SocketChannel.SystemUpdateLogObject, Message.SUCCESS_UPDATE_LINUX_PACKAGES);
                    this.restart();
                    resolve(true);
                });
        })
    }

    restart(): void {
        process.on("exit", () => {
            Log.debug(Message.RESTART_IN_PROGRESS);
            SocketIO.emit(SocketChannel.SystemUpdateLogObject, Message.RESTART_IN_PROGRESS);
            require("child_process")
                .spawn(
                    process.argv.shift(),
                    process.argv,
                    {
                        cwd: process.cwd(),
                        detached: true,
                        stdio: "inherit"
                    }
                );
        });
        process.exit();
    }

    updateServer(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            exec("git pull",
                async (error, stdout, stderr) => {
                    if (stdout.includes("Already up to date")) {
                        Log.debug(Message.UP_TO_DATE);
                        SocketIO.emit(SocketChannel.SystemUpdateLogObject, Message.UP_TO_DATE);
                        resolve(false);
                    } else {
                        Log.debug(Message.PULL_NEW_VERSION);
                        SocketIO.emit(SocketChannel.SystemUpdateLogObject, Message.PULL_NEW_VERSION);
                        await this.updateNodeDependencies();
                        resolve(true);
                    }
                });
        })
    }

    updateNodeDependencies(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            exec("npm i",
                async (error, stdout, stderr) => {
                    if (error) {
                        Log.debug(Message.FAILED_UPDATE_NPM_PACKAGES);
                        SocketIO.emit(SocketChannel.SystemUpdateLogObject, Message.FAILED_UPDATE_NPM_PACKAGES);
                        resolve(false);
                        return;
                    }
                    if (stderr) {
                        Log.debug(Message.FAILED_UPDATE_NPM_PACKAGES);
                        SocketIO.emit(SocketChannel.SystemUpdateLogObject, Message.FAILED_UPDATE_NPM_PACKAGES);
                        resolve(false);
                        return;
                    }
                    Log.debug(Message.SUCCESS_UPDATE_NPM_PACKAGES);
                    SocketIO.emit(SocketChannel.SystemUpdateLogObject, Message.SUCCESS_UPDATE_NPM_PACKAGES);
                    await this.updatePackages();
                    resolve(true);
                });
        })
    }

    setGPSPerms(): void {
        exec("chmod 777 /dev/ttyACM0",
            async (error, stdout, stderr) => {
                Log.info('[GPS] Setup GPS-Adapter Permissions');
            });
    }

}
