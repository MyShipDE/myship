import express from "express";
import {Storage} from "../DatabaseProvider";
import {Between, FindOperator, IsNull} from "typeorm";
import {startOfDay, endOfDay} from 'date-fns';
import {CountryGeolocationService} from "../services/VDR/CountryGeolocationService";
import {SignalKIdentifier} from "../classes/SignalKIdentifier";

export class LogbookArchiveController {

    async GetAll(req: express.Request, res: express.Response) {

        if (req.params.page == null) {
            return res.status(400).end();
        }

        try {
            const tracks = await Storage.getInstance().Track.find({
                take: 10,
                skip: 10 * +req.params.page,
                order: {
                    id: 'DESC'
                }
            })
            return res.status(200).send(tracks);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetAllByDetails(req: express.Request, res: express.Response) {

        if (req.params.take == null) {
            return res.status(400).end();
        }

        if (req.params.skip == null) {
            return res.status(400).end();
        }

        const take: number = +req.params.take;
        const skip: number = +req.params.skip;

        try {
            const tracks = await Storage.getInstance().Track.find({
                take,
                skip,
                order: {
                    id: 'DESC'
                }
            })
            return res.status(200).send(tracks);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetByDate(req: express.Request, res: express.Response) {

        if (req.params.page == null || req.params.date == null) {
            return res.status(400).end();
        }

        const searchDate: Date = new Date(req.params.date);

        try {
            const tracks = await Storage.getInstance().Track.find({
                take: 10,
                skip: 10 * +req.params.page,
                where: {
                    createdAt: Between(startOfDay(searchDate), endOfDay(searchDate))
                }
            })
            return res.status(200).send(tracks);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetAvailableDates(req: express.Request, res: express.Response) {
        try {
            const tracks = await Storage.getInstance().Track.find();
            const dates = tracks.map((x) => x.createdAt);
            return res.status(200).send({
                dates
            });
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetCountTracks(req: express.Request, res: express.Response) {
        try {
            const tracksCount = await Storage.getInstance().Track.count({
                where: {
                    stopAt: null
                }
            })
            return res.status(200).send({
                tracksCount
            });
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetByCountry(req: express.Request, res: express.Response) {
        try {
            const tracks = await Storage.getInstance().Track.find();
            const data = await CountryGeolocationService.filterTracksByLocation(tracks);
            return res.status(200).send(data);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetCoordsByDateRange(req: express.Request, res: express.Response) {

        if (req.params.start == null || req.params.end == null) {
            return res.status(400).end();
        }

        const startDate: Date = new Date(req.params.start);
        const endDate: Date = new Date(req.params.end);

        try {
            const coords: number[][] = [];
            const tracks = await Storage.getInstance().Track.find({
                where: {
                    createdAt: Between(startOfDay(startDate), endOfDay(endDate))
                }
            });
            
            for (const track of tracks) {
                const records = await Storage.getInstance().TrackRecord.find({
                    relations: {
                        track: true
                    },
                   where: {
                       track: {
                            id: track.id
                       }
                   }
                });
                for (const record of records) {
                    const data = await Storage.getInstance().TrackData.find({
                        relations: {
                            record: true,
                            identifier: true
                        }, where: {
                            record: {
                                id: record.id
                            }
                        }
                    });
                    const latitude = data.find(d => d.identifier.identifier === SignalKIdentifier.navigationPositionValueLatitude);
                    const longitude = data.find(d => d.identifier.identifier === SignalKIdentifier.navigationPositionValueLongitude);
                    coords.push([latitude.value, longitude.value]);
                }
            }
            
            return res.status(200).send(coords);
        } catch (e) {
            return res.status(500).end();
        }
    }

    async GetVoiceEntries(req: express.Request, res: express.Response) {
        try {
            const entries = await Storage.getInstance().VoiceEntry.find();
            res.status(200).send(entries);
        } catch (e) {
            return res.status(500).end();
        }
    }
    
}
