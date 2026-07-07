import express from "express";
import {TrackService} from "../services/VDR/TrackService";
import {Storage} from "../DatabaseProvider";
import {Track} from "../modals/Track";
import {SocketIO} from "../services/socket.io/SocketIO";
import {SocketChannel} from "../resources/SocketChannel";
import {Log} from "../services/helpers/Log";

export class TrackController {

    async getTrack(req: express.Request, res: express.Response) {
        try {
            if (req.params.id == null) {
                return res.status(400).end();
            }

            const track = await TrackService.Instance.getTrack(+req.params.id);

            if (track == null) {
                return res.status(404).end();
            }

            for (const record of track.records) {
                record.data = await TrackService.Instance.getBasicTrackData(record);
            }

            return res.status(200).send(track);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async getTrackDataByKey(req: express.Request, res: express.Response) {
        try {
            if (req.params.recordId == null || req.params.key == null) {
                return res.status(400).end();
            }

            const trackData = await TrackService.Instance.getTrackDataByKey(+req.params.recordId, req.params.key);

            if (trackData == null) {
                return res.status(404).end();
            }

            return res.status(200).send(trackData);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async getLastTrack(req: express.Request, res: express.Response) {
        try {
            const track = await TrackService.Instance.getLastTrack();

            if (track == null) {
                return res.status(404).end();
            } else {

                for (const record of track.records) {
                    record.data = await TrackService.Instance.getBasicTrackData(record);
                }

                return res.status(200).send(track);
            }
        } catch (e) {
            return res.status(500).end();
        }
    }

    async getTracks(req: express.Request, res: express.Response) {
        try {
            const tracks = await TrackService.Instance.getTracks();
            if (tracks !== null) {
                return res.status(200).send(tracks);
            }
        } catch (e) {
            return res.status(500).end();
        }
    }

    async PutChangeTrackName(req: express.Request, res: express.Response) {

        if (req.body == null) {
            return res.status(400).end();
        }

        try {
            const parsedObj: Track = Object.assign(new Track(), req.body);

            const track = await Storage.getInstance().Track.findOneBy({id: parsedObj.id});

            if (track == null) {
                return res.status(404).end();
            }

            track.name = parsedObj.name;
            await track.save();

            SocketIO.emit(SocketChannel.TrackManagedObject, track);
            SocketIO.emit(SocketChannel.TrackManagedNotification, null);

            return res.status(200).end();

        } catch (e) {
            return res.status(500).end();
        }
    }

    async getTrackDataKeys(req: express.Request, res: express.Response) {
        try {
            const keys = await Storage.getInstance().TrackDataKey.find();

            if (keys == null) {
                return res.status(404).end();
            }

            return res.status(200).send(keys);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async getTrackDataUnits(req: express.Request, res: express.Response) {
        try {
            const units = await Storage.getInstance().TrackDataUnit.find();

            if (units == null) {
                return res.status(404).end();
            }

            return res.status(200).send(units);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async getRecordById(req: express.Request, res: express.Response) {
        try {
            const recordId = +req.params.id;
            const record = await TrackService.Instance.getRecord(recordId);

            if (record == null) {
                return res.status(404).end();
            }

            return res.status(200).send(record);
        } catch (e) {
            return res.status(500).end();
        }
    }

}
