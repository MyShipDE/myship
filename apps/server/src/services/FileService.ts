import {File} from "../modals/File";
import fs from 'fs';
import {Storage} from "../DatabaseProvider";

export class FileService {

    static async saveFile(name: string, uploadedFile: any, directoryId: any = null) {
        const file = new File();
        file.name = name;
        if (directoryId != null) {
            file.directoryId = +directoryId;
        }

        if (await file.save()) {
            const extArr = uploadedFile.originalname.split(".");
            const ext = extArr[extArr.length - 1];
            file.path = __dirname + '/../../storage/files/' + file.id + '.' + ext;
            await file.save();
            await fs.renameSync(uploadedFile.path, file.path);
            return true;
        }
    }

    static async getFile(id: number) {
        return await Storage.getInstance().File.findOneBy({id});
    }

    static async delete(id: number) {
        const fileMetaData = await Storage.getInstance().File.findOneBy({id});
        if (fileMetaData != null) {
            if (!fileMetaData.isDirectory) {
                if (fs.existsSync(fileMetaData.path)) {
                    await fs.unlinkSync(fileMetaData.path);
                }
            } else if (fileMetaData.isDirectory) {
                const files = await Storage.getInstance().File.findBy({directoryId: fileMetaData.id});
                for (const file of files) {
                    await FileService.delete(file.id);
                }
            }
            await fileMetaData.remove();
            return true;
        }
        return false;
    }

    static async createDir(name: string, directoryId: number) {
        const dir = new File();
        dir.name = name;
        dir.isDirectory = true;
        dir.directoryId = directoryId;
        await dir.save();
        return true;
    }

    static async getFiles() {
        return await Storage.getInstance().File.find();
    }

}
