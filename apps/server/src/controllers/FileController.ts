import express from "express";
import {check, body, validationResult} from 'express-validator';
import {FileService} from "../services/FileService";
import fs from 'fs';
import path from 'path';
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class FileController {

    async saveFile(req: express.Request, res: express.Response) {

        body('name').isString();

        if (req.files == null) {
            res.status(400).end("Request-Body contains no files.");
            return;
        }

        let directoryId = null;
        if (req.body.directory_id != null) {
            directoryId = req.body.directory_id;
        }

        // @ts-ignore
        const file: UploadedFile = req.files[0];

        if (await FileService.saveFile(req.body.name, file, directoryId)) {
            SocketIO.emit(SocketChannel.FileManagedNotification, null);
            res.status(200).end();
        }

        res.status(500).end();

    }

    async getFile(req: express.Request, res: express.Response) {
        if (req.params.id == null) {
            res.status(400).end();
            return;
        }

        const fileMetaData = await FileService.getFile(+req.params.id);
        if (await fs.existsSync(fileMetaData.path)) {
            res.status(200).sendFile(path.resolve(fileMetaData.path));
            return;
        }
        res.status(500).end();
    }

    async getFileMeta(req: express.Request, res: express.Response) {
        if (req.params.id == null) {
            res.status(400).end();
            return;
        }
        const fileMetaData = await FileService.getFile(+req.params.id);

        if (fileMetaData != null) {
            res.status(200).send(fileMetaData);
        }
        res.status(500).end();
    }

    async getFilesMeta(req: express.Request, res: express.Response) {
        const filesMetaData = await FileService.getFiles();

        if (filesMetaData != null) {
            res.status(200).send(filesMetaData);
        }
        res.status(500).end();
    }

    async delete(req: express.Request, res: express.Response) {
        if (req.params.id == null) {
            res.status(400).end();
            return;
        }
        if (await FileService.delete(+req.params.id)) {
            SocketIO.emit(SocketChannel.FileManagedNotification, null);
            res.status(200).end();
            return;
        }
        res.status(500).end();
    }

    async createDir(req: express.Request, res: express.Response) {

        body('name').isString();

        let directoryId = null;
        if (req.body.directoryId != null) {
            directoryId = req.body.directory_id;
        }

        if (await FileService.createDir(req.body.name, directoryId)) {
            SocketIO.emit(SocketChannel.FileManagedNotification, null);
            res.status(200).end();
        }

        res.status(500).end();

    }

}
