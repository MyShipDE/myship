import {String} from "./helpers/String";
import compressing from "compressing";
import path from "path";
import {App} from "../app";


export class CompressService {

    private static _instance: CompressService;

    async compress(stringToCompress: string): Promise<string> {
        return new Promise(resolve => {
            const fileName = `${String.generate(16)}.gz`;
            const filePath = path.join(App.storageTempPath, fileName);

            compressing.gzip.compressFile(Buffer.from(stringToCompress), filePath)
                .then(() => {
                    resolve(filePath);
                })
                .catch(err => {
                    throw err;
                });
        });
    }

    async decompress(fileName: string): Promise<string> {
        return new Promise(resolve => {
            const filePath = path.join(App.storageTempPath, fileName);
            const newPath = filePath.replace('.gz', 'org');

            compressing.gzip.decompress(filePath, newPath)
                .then(() => {
                    resolve(newPath);
                })
                .catch(err => {
                    throw err;
                });
        });
    }

    public static getInstance(): CompressService {
        if (this._instance == null) {
            this._instance = new CompressService();
        }
        return this._instance;
    }

}