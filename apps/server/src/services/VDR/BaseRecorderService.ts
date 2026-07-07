import {Log} from "../helpers/Log";
import {TrackDetailExtension} from "./TrackDetailExtension";
import {TemplateService} from "./TemplateService";
import {SignalKHelper} from "../helpers/SignalKHelper";
import {Track} from "../../modals/Track";
import {DateHelper} from "../helpers/DateHelper";
import {SocketIO} from "../socket.io/SocketIO";
import {SocketChannel} from "../../resources/SocketChannel";
import {SignalKIdentifier} from "../../classes/SignalKIdentifier";
import {Coordinate} from "../../classes/Coordinate";
import {TrackRecord} from "../../modals/TrackRecord";
import {UnitHelper} from "../helpers/UnitHelper";
import {SignalKDataSet} from "../../classes/SignalKDataSet";

export class BaseRecorderService extends TrackDetailExtension {

    prevPositionLatitude: number;
    prevPositionLongitude: number;
    prevCourse: number;
    prevRecordCreatedAt: Date;

    protected async shouldCreateRecord(data = SignalKHelper.getInstance().cachedData): Promise<boolean> {

        if (data == null || data.length === 0) {
            Log.error('[VDR] No data found!');
            return false;
        }

        const latitude = data.find(d => d.path === SignalKIdentifier.navigationPositionValueLatitude);
        const longitude = data.find(d => d.path === SignalKIdentifier.navigationPositionValueLongitude);
        const course = data.find(d => d.path === SignalKIdentifier.navigationCourseOverGroundTrue);
        // const rpm = data.find(d => d.path === SignalKIdentifier.electricalAlternators0RevolutionsValue);
        // const speed = data.find(d => d.path === SignalKIdentifier.navigationSpeedOverGround);

        /* const prev = await this.getLatestLogEntry();

        if (prev == null) {
            Log.error('[VDR] No latest log entry found!');
            return false;
        }

        const prevLatitude = prev.data.find(d => d.identifier.identifier === SignalKIdentifier.navigationPositionValueLatitude);
        const prevLongitude = prev.data.find(d => d.identifier.identifier === SignalKIdentifier.navigationPositionValueLongitude);
        const prevCourse = prev.data.find(d => d.identifier.identifier === SignalKIdentifier.navigationCourseOverGroundTrue); */

        const prevLatitude = this.prevPositionLatitude;
        const prevLongitude = this.prevPositionLongitude;
        const prevCourse = this.prevCourse;

        if (prevLongitude == null || prevLatitude == null) {
            Log.error('[VDR] No previous position data found!');
            return false;
        } else {

            Log.debug('[VDR] Previous position found, checking if position or course changed!');

            const template = await TemplateService.getInstance().GetActive();

            if (template == null) {
                Log.debug('[VDR] No active template found!');
                return false;
            }

            if (latitude == null || longitude == null) {
                Log.debug('[VDR] No position data found!');
                return false;
            }

            const activeTrack = await this.getActiveTrack();

            if (activeTrack != null && course?.value != null && prevCourse != null) {
                const prevCourseValue = UnitHelper.convert(prevCourse, 'rad').value;
                const currentCourseValue = UnitHelper.convert(course.value, 'rad').value;
                Log.debug('[VDR] Previous course: ' + prevCourseValue + ', Current course: ' + currentCourseValue);
                if (this.isCourseChanged(prevCourseValue, currentCourseValue, template.allowedCourseChange)) {
                    return true;
                } else {
                    Log.debug('[VDR] Course not changed!');
                }
            }

            const prevPosition: Coordinate = {
                latitude: prevLatitude,
                longitude: prevLongitude
            };
            const currentPosition: Coordinate = {
                latitude: latitude?.value,
                longitude: longitude?.value
            }

            if (activeTrack == null) {

                Log.debug('[VDR] No active track found, checking if position changed!');

                if (this.isPositionChanging(prevPosition, currentPosition, 20)) {
                    Log.debug('[VDR] Position changed!');
                    return true;
                }

                /* if (rpm != null && rpm.value > 0) {
                    Log.debug('[VDR] Active track not found, but engine is running!');
                    return true;
                } */

                /* if (speed != null && UnitHelper.convert(speed.value, 'm/s').value >= 0.5) {
                    Log.debug('[VDR] Active track not found, but boat is moving!');
                    return true;
                } */

            } else {
                Log.debug('[VDR] Active track found!');
            }

            if (this.prevRecordCreatedAt != null) {
                this.prevRecordCreatedAt = new Date();
            }

            if (activeTrack != null &&
                !(await this.CheckIfIntervalReached(this.prevRecordCreatedAt))) {
                Log.debug('[VDR] Interval not reached!');
                return false;
            }

            if (activeTrack != null && this.isPositionChanging(prevPosition, currentPosition, template.radiusOfMovement)) {
                Log.debug('[VDR] Position changed!');
                return true;
            }

        }
        return false;
    }

    private sufficientSatellitesAvailable(data: SignalKDataSet[]): boolean {

        const minSatellites = 4;
        const minGoodSNR = 30;

        const satellitesData = data.find(d => d.path.includes(SignalKIdentifier.navigationSatellitesInViewSatellites));

        if (satellitesData == null) {
            Log.warn('[VDR] No satellite data found!');
            return false;
        }

        const json = JSON.parse(satellitesData.value as string);

        const satellites = json as unknown[] as {
            id: number,
            elevation: number,
            azimuth: number,
            SNR: number
            used: boolean,
            weightedAverage: number
        }[];

        if (satellites == null) {
            Log.warn('[VDR] Satellite data is empty!');
            return false;
        }

        let weightedAverage = 0;
        let greatSatellites = 0;

        for (const satellite of satellites) {
            if (satellite.SNR >= minGoodSNR) {
                satellite.weightedAverage = satellite.SNR * Math.sin(satellite.elevation);
                weightedAverage += satellite.weightedAverage;
                greatSatellites++;
            }
        }

        if (greatSatellites > 0) {
            weightedAverage /= greatSatellites;
        }

        const weightedFactor = satellites.length * 0.5;

        const index = weightedFactor + weightedAverage;

        Log.debug(`GNSS-Quality Index: ${index}, Great-Satellites: ${greatSatellites}`);

        const result = greatSatellites >= minSatellites; // index >= 35

        if (result) {
            Log.debug('[VDR] Sufficient satellites available!');
        } else {
            Log.debug('[VDR] Insufficient satellites available!');
        }

        return result;
    }

    protected async isCourseChangedIgnoreInterval(data = SignalKHelper.getInstance().cachedData): Promise<boolean> {

        if (data == null || data.length === 0) {
            Log.error('[VDR] No data found!');
            return false;
        }

        const course = data.find(d => d.path === SignalKIdentifier.navigationCourseOverGroundTrue);
        Log.debug('[VDR] Current course: ' + course?.value);
        const prev = await this.getLatestLogEntry();

        if (prev == null) {
            Log.error('[VDR] No latest log entry found!');
            return false;
        }

        const prevCourse = prev.data.find(d => d.identifier.identifier === SignalKIdentifier.navigationCourseOverGroundTrue);
        Log.debug('[VDR] Previous course: ' + prevCourse?.value);

        if (prev == null) {
            Log.error('[VDR] No latest log entry found!');
            return false;
        } else {

            Log.debug('[VDR] Latest log entry found, checking if course changed!');

            const template = await TemplateService.getInstance().GetActive();

            if (template == null) {
                Log.debug('[VDR] No active template found!');
                return false;
            }

            if (course?.value != null && prevCourse?.value != null) {
                const prevCourseValue = UnitHelper.convert(prevCourse.value, 'rad').value;
                const currentCourseValue = UnitHelper.convert(course.value, 'rad').value;
                if (this.isCourseChanged(prevCourseValue, currentCourseValue, template.allowedCourseChange)) {
                    if (await this.getActiveTrack() == null) {
                        Log.debug('[VDR] No active track found!');
                        return false;
                    }
                    return true;
                } else {
                    Log.debug('[VDR] Course not changed!');
                }
            } else {
                Log.debug('[VDR] No course data found!');
            }

        }

        Log.debug('[VDR] Check if Course changed - returned false!');
        return false;
    }

    protected async getCurrentTrack(): Promise<Track> {
        const latestTrack = await this.getLastTrack();
        let track = await this.getActiveTrack();
        if (track == null) {
            track = new Track();
            SocketIO.emit(SocketChannel.VdrServiceStateObject, true);
        } else if (latestTrack != null && this.isWithinLast30Minutes(latestTrack.createdAt)) {
            track = latestTrack;
            track.stopAt = null;
            SocketIO.emit(SocketChannel.VdrServiceStateObject, true);
        }
        track = await track.save();
        return track;
    }

    protected async shouldStopRecord(): Promise<boolean> {
        const activeTrack = await this.getActiveTrack();
        const latestLog = await this.getLatestLogEntry();
        const template = await TemplateService.getInstance().GetActive();
        if (latestLog != null && activeTrack != null && template != null &&
            new Date() > DateHelper.addMinutes(template.idleTime, latestLog.createdAt)) {
            activeTrack.stopAt = new Date();
            await activeTrack.save();
            SocketIO.emit(SocketChannel.VdrServiceStateObject, false);
            Log.debug('[VDR] Stopped recording!');
            return true;
        }
        return false;
    }

    public setPrevPosition() {
        const cache = SignalKHelper.getInstance().cachedData;
        const latitude = cache.find(d => d.path === SignalKIdentifier.navigationPositionValueLatitude);
        const longitude = cache.find(d => d.path === SignalKIdentifier.navigationPositionValueLongitude);
        const course = cache.find(d => d.path === SignalKIdentifier.navigationCourseOverGroundTrue);
        if (latitude != null && longitude != null) {
            this.prevPositionLatitude = latitude.value;
            this.prevPositionLongitude = longitude.value;
        }
        if (course != null) {
            this.prevCourse = course.value;
        }
    }

    async ensureCurrentPositionStored() {
        if (this.prevPositionLatitude == null || this.prevPositionLongitude == null) {
            await new Promise<void>(r => setTimeout(r, 2000));
            this.setPrevPosition();
            await this.ensureCurrentPositionStored();
        }
        /* const lastPosition = await this.getLastPosition();

        if (lastPosition == null) {
            await this.createTrackRecord();
            return;
        }*/
    }

}
