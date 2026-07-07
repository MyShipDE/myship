import dotenv from 'dotenv';
import {createLogger, format, transports} from 'winston';
import path from "path";
import {App} from "../../app";
import {LEVEL} from "triple-beam";
import moment from 'moment';

dotenv.config();

export class Log {

    private static write(message: string, type: LogType): void {

        const { combine, timestamp, label, printf } = format;

        const logger = createLogger({
            level: process.env.DEBUG === "true" ? 'debug' : 'info',
            format: combine(
                label({ label: 'right meow!' }),
                timestamp(),
                printf(info => {
                    return `${this.getTime()} [${info.level.toUpperCase()}]: ${info.message}`;
                })
            ),
            transports: [
                new transports.File({
                    filename: path.join(App.logFilePath, 'error.log'), level: 'error'
                }),
                new transports.File({
                    filename: path.join(App.logFilePath, 'combine.log')
                }),
                new transports.Console()
            ],
        });

        switch (type) {
            case LogType.INFO:
                logger.info(message);
                break;
            case LogType.DEBUG:
                logger.debug(message);
                break;
            case LogType.ERROR:
                logger.error(message);
                break;
            case LogType.FATAL:
                logger.error(message);
                break;
            case LogType.WARN:
                logger.warn(message);
                break;
        }
    }

    static info(message: any): void {
        this.write(message, LogType.INFO);
    }

    static debug(message: any): void {
        if (process.env.DEBUG === "true") {
            this.write(message, LogType.DEBUG);
        }
    }

    static error(message: any): void {
        this.write(message, LogType.ERROR);
    }

    static fatal(message: any): void {
        this.write(message, LogType.FATAL);
    }

    static warn(message: any): void {
        this.write(message, LogType.WARN);
    }

    private static getTime() {
        moment.locale('de');
        return moment(new Date()).format('L LTS');
    }

}

export enum LogType {
    INFO,
    DEBUG,
    ERROR,
    FATAL,
    WARN,
}
