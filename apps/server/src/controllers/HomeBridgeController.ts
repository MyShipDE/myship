import express from "express";
import lightGroupService from "../services/lightGroupService";
import {Storage} from "../DatabaseProvider";
import {RGBHelper} from "../services/helpers/RGBHelper";
import {BridgeIdentifier} from "../services/BridgeService";
import {TasmotaService, TasmotaState} from "../services/TasmotaService";

export class HomeBridgeController {

    // OLD
    async getStatus(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            let status = "0";
            const lightGroup = await Storage.getInstance().LightGroup.findOneBy({id: +req.params.id});
            if (lightGroup != null && lightGroup.lights != null) {
                lightGroup.lights.forEach((light: any) => {
                    if (light.isActive) {
                        status = "1";
                    }
                });
                return res.status(200).send(status);
            }
        }
        res.status(400).send();
    }

    /*
    static async lightOff(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            res.status(200).end();
            await lightGroupService.control(+req.params.id, 0, 0, 0, 255);
            return;
        }
        res.status(400).end();
    }
    static async lightOn(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            const scene = await Scene.getById(1);
            res.status(200).end();
            if (scene != null) {
                await lightGroupService.control(+req.params.id, scene.r, scene.g, scene.b, 255);
            } else {
                await lightGroupService.control(+req.params.id, 255, 255, 255, 255);
            }
            return;
        }
        res.status(400).end();
    }
     */

    async GetLightGroupState(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            let status = "0";
            const lightGroup = await Storage.getInstance().LightGroup.findOne({
                relations: {
                    lights: true
                },
                where: {id: +req.params.id}
            });
            if (lightGroup != null && lightGroup.lights != null) {
                lightGroup.lights.forEach((light: any) => {
                    if (light.isActive) {
                        status = "1";
                    }
                });
                return res.status(200).send(status);
            } else {
                return res.status(404).end();
            }
        }
        res.status(400).send();
    }

    async PostLightGroupOff(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            res.status(200).end();
            await lightGroupService.control(+req.params.id, 0, 0, 0, 255);
            return;
        }
        res.status(400).end();
    }

    async PostLightGroupOn(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            const scene = await Storage.getInstance().Scene.findOneBy({id: 1});
            const lightGroup = await Storage.getInstance().LightGroup.findOne({
                relations: {
                    lights: true
                },
                where: {id: +req.params.id}
            });
            if (lightGroup.lights[0].R !== null) {
                await lightGroupService.control(+req.params.id, lightGroup.lights[0].R, lightGroup.lights[0].G, lightGroup.lights[0].B, 255);
            } else {
                await lightGroupService.control(+req.params.id, 255, 180, 80, 255);
            }
            return res.status(200).end();
        }
        res.status(400).end();
    }

    async GetLightGroupBrightness(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            const lightGroup = await Storage.getInstance().LightGroup.findOne({
                relations: {
                    lights: true
                },
                where: {id: +req.params.id}
            });
            if (lightGroup != null) {
                if (lightGroup.lights != null && lightGroup.lights.length > 0) {
                    res.status(200).send({
                        bri: RGBHelper.valueToPercentage(lightGroup.lights[0].BRI)
                    });
                    return;
                }
            }
        }
        res.status(400).end();
    }

    async PutLightGroupBrightness(req: express.Request, res: express.Response) {
        if (req.params.id != null && req.params.bri != null) {
            const lightGroup = await Storage.getInstance().LightGroup.findOne({
                relations: {
                    lights: true
                },
                where: {id: +req.params.id}
            });
            if (lightGroup != null) {
                const lights = lightGroup.lights;
                if (lights != null && lights.length > 0 && lights[0].R != null) {
                    res.status(200).end();
                    await lightGroupService.control(+req.params.id, lights[0].R, lights[0].G, lights[0].B, +req.params.bri);
                    return;
                }
            }
        }
        res.status(400).end();
    }

    async GetLightGroupRGB(req: express.Request, res: express.Response) {
        if (req.params.id != null) {
            const lightGroup = await Storage.getInstance().LightGroup.findOne({
                relations: {
                    lights: true
                },
                where: {id: +req.params.id}
            });
            if (lightGroup != null) {
                const lights = lightGroup.lights;
                if (lights != null && lights.length > 0) {

                    const r = lights[0].R;
                    const g = lights[0].G;
                    const b = lights[0].B;

                    if (r == null || g == null || b == null) {
                        return res.status(200).send("000000");
                    }

                    return res.status(200).send(RGBHelper.convertRGBToHex(r, g, b));
                }
            }
        }
        res.status(400).end();
    }

    async PutLightGroupRGB(req: express.Request, res: express.Response) {

        if (req.params.hex != null) {

            const h = "#" + req.params.hex;
            const rgb = RGBHelper.hexToRgb(h);

            const r = rgb.r;
            const g = rgb.g;
            const b = rgb.b;

            if (req.params.id != null) {
                const lightGroup = await Storage.getInstance().LightGroup.findOne({
                    relations: {
                        lights: true
                    },
                    where: {id: +req.params.id}
                });
                if (lightGroup != null) {
                    const lights = lightGroup.lights
                    if (lights != null && lights.length > 0 && lights[0].BRI != null) {
                        res.status(200).end();
                        await lightGroupService.control(+req.params.id, r, g, b, lights[0].BRI);
                        return;
                    }
                }
            }
        }

        res.status(400).end();
    }

    async controlDevice(req: express.Request, res: express.Response) {

        try {

            const id = +req.params.id;
            const state = req.params.state === "on";

            const device = await Storage.getInstance().Device.findOne({
                relations: {
                    bridge: {
                        type: true
                    },
                },
                where: {id}
            });

            if (device == null) {
                return res.status(404).end();
            }

            if (device.bridge == null || device.bridge.type == null) {
                return res.status(500).end();
            }

            if (device.bridge.type.identifier === BridgeIdentifier.bridge12v4cSon) {
                await TasmotaService.control(device.bridge, device.bridgePort, state);
                return res.status(200).end();
            }

        } catch (e) {
            return res.status(500).end();
        }

    }

    async getDeviceState(req: express.Request, res: express.Response) {

        try {

            const id = +req.params.id;

            const device = await Storage.getInstance().Device.findOne({
                relations: {
                    bridge: {
                        type: true
                    },
                },
                where: {id}
            });

            if (device == null) {
                return res.status(404).end();
            }

            if (device.isActive) {
                return res.status(200).send("1");
            } else {
                return res.status(200).send("0");
            }

        } catch (e) {
            return res.status(500).end();
        }

    }

}
