import userService from '../services/userService';
import express from "express";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";

export class UserController {

    async getUser(req: express.Request, res: express.Response) {
        const user = await userService.get(req.header("Authorization"), req.ip);
        if (user != null) {
            delete user.token;
            delete user.secret;
        }
        res
            .cookie('uuid', req.header("Authorization"), {maxAge: 900000, httpOnly: false})
            .status(200)
            .send(user);
    }

    async getClients(req: express.Request, res: express.Response) {
        const clients = await userService.getAll();
        if (clients != null) {
            clients.forEach((client: any) => { // TODO: Create Class or Interface for Clients
                delete client.app_secret;
            });
            res.status(200).send(clients);
        }
        res.status(400).end();
    }

    async login(req: express.Request, res: express.Response) {
        if (req.header("Authorization") != null && req.body.token != null) {
            if (await userService.login(req.body.token, req.header("Authorization"), req.ip, req.body.clientInfo ?? null)) {
                SocketIO.emit(SocketChannel.ClientManagedNotification, null);
                res.status(200).end();
            } else {
                res.status(400).end("Error while register client in database.");
            }
        } else {
            res.status(400).end("Request data is corrupt.");
        }
    }

    async createClient(req: express.Request, res: express.Response) {
        if (req.body.token != null && req.body.comment != null && (req.body.isAdmin == null || req.body.isAdmin === "1")) {
            let isAdmin = false;
            if (req.body.isAdmin === "1") {
                isAdmin = true;
            }
            const client = await userService.create(req.body.token, req.body.comment, isAdmin);
            if (client) {
                SocketIO.emit(SocketChannel.ClientManagedNotification, null);
                res.status(200).send(client);
                return;
            }
            res.status(500).end();
            return;
        }
        res.status(400).end();
    }

    async deleteClient(req: express.Request, res: express.Response) {
        if (await userService.deleteClient(+req.params.id, req.header("Authorization"))) {
            SocketIO.emit(SocketChannel.ClientManagedNotification, null);
            res.status(200).end();
        }
        res.status(400).end();
    }

    async saveSession(req: express.Request, res: express.Response) {
        if (req.params.uuid == null) {
            res.status(400).end();
            return;
        }
        res.cookie('uuid', req.params.uuid, {maxAge: 900000, httpOnly: false}).status(200).end();
    }

}
