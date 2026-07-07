import httpProxy from "http-proxy";
import http from "http";
import {AuthService} from "./AuthService";
import {Log} from "./helpers/Log";
import {param} from "express-validator";

export class ProxyService {

    static run(targetHost: string, targetPort: number, listenPort: number, skipHttpAuth: boolean = false, wsAuth: boolean = true): void {

        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        };

        try {
            const proxy = httpProxy.createProxyServer({
                target: {
                    host: targetHost,
                    port: targetPort
                }
            });
            const proxyServer = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {

                if (req.method === "OPTIONS") {
                    res.writeHead(200, headers);
                    res.end();
                    return;
                }

                if (skipHttpAuth) {
                    proxy.web(req, res);
                    return;
                }

                let uuid = null;
                if (req.headers.authorization != null) {
                    uuid = req.headers.authorization.replace("JWT ", "");
                    Log.info('UUID from Header: ' + uuid);
                } else {
                    const cookies: any = this.parseCookies(req);
                    if (cookies.uuid == null) {

                        const url = req.url;
                        if (url.includes('token')) {
                            const urlArr = url.split('?');
                            if (urlArr.length > 1) {
                                const params = urlArr[1];
                                const paramsArr = params.split('&');
                                const uuidParam = paramsArr.find(x => x.includes('token'));
                                const uuidParamArr = uuidParam.split('=');
                                if (uuidParamArr.length > 1) {
                                    uuid = uuidParamArr[1];
                                    Log.info('UUID from Params: ' + uuid);
                                }
                            }
                        }

                    } else {
                        Log.info('UUID from Cookie: ' + uuid);
                        uuid = cookies.uuid;
                    }
                }

                const ip = req.socket.remoteAddress.replace('::ffff:', '');

                if (await AuthService.authenticate(ip, uuid)) {
                    proxy.web(req, res);
                    return;
                }

                res.writeHead(401, headers);
                res.end();
            });

            proxyServer.on('upgrade', async (req, socket, head) => {

                if (wsAuth) {
                    let uuid = null;
                    const url = req.url;
                    const ip = req.socket.remoteAddress.replace('::ffff:', '');
                    if (url.includes('proxyToken')) {
                        const urlArr = url.split('?');
                        if (urlArr.length > 1) {
                            const params = urlArr[1];
                            const paramsArr = params.split('&');
                            const uuidParam = paramsArr.find((x: string | string[]) => x.includes('proxyToken'));
                            const uuidParamArr = uuidParam.split('=');
                            if (uuidParamArr.length > 1) {
                                uuid = uuidParamArr[1];
                                if (await AuthService.authenticate(ip, uuid)) {
                                    proxy.ws(req, socket, head);
                                    return;
                                }
                            }
                        }
                    }
                } else {
                    proxy.ws(req, socket, head);
                }

            });

            proxyServer.listen(listenPort);
        } catch(e) {
            Log.error('Es ist ein Fehler des Proxies aufgetreten!');
        }

    }

    static parseCookies(request: http.IncomingMessage) {
        const list = {};
        const cookieHeader = request.headers?.cookie;
        if (!cookieHeader) return list;

        cookieHeader.split(`;`).forEach((cookie) => {
            // tslint:disable-next-line:prefer-const
            let [ name, ...rest] = cookie.split(`=`);
            name = name?.trim();
            if (!name) return;
            const value = rest.join(`=`).trim();
            if (!value) return;
            // @ts-ignore
            list[name] = decodeURIComponent(value);
        });

        return list;
    }

}
