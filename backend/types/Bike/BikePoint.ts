import {
    getAllBikePoints,
    getBikePointFromId,
    searchBikePoints,
    addBikePoint
} from '../../db/schemas/BikePoint.factory';
import {
    LatLong,
    LatLongNum,
    getDistanceBetweenLatLong
} from '../LatLong';

import { TfLBikePointAPI } from '../../upstreamRequestHelpers/TfLUnifiedAPI';

interface PointStatus {
    installed: boolean;
    locked: boolean;
    bikesAvailable: number;
    docksAvailable: number;
    docksTotal: number;
}

export default class BikePoint {
    id: string;
    url: string;
    name: string;
    location: LatLong;
    type: string;
    terminalName: string;
    installDate: string;
    temporary: boolean;
    status: PointStatus;

    constructor(
        id: string,
        url: string,
        name: string,
        location: LatLong,
        type: string,
        terminalName: string,
        installDate: string,
        temporary: boolean,
        status: PointStatus
    ) {
        this.id = id;
        this.url = url;
        this.name = name;
        this.location = location;
        this.type = type;
        this.terminalName = terminalName;
        this.installDate = installDate;
        this.temporary = temporary;
        this.status = status;
    }

    static async fromId(id: string) {
        try {
            // todo: tidy
            let point = await getBikePointFromId(id);
            if (point === null) {
                point = await TfLBikePointAPI.getBikePointFromId(id);
            }
            if (!point) {
                throw ({ message: `BikePoint ${id} does not exist` });
            } else {
                addBikePoint(point);
            }

            return new BikePoint(
                point.id,
                point.url,
                point.name,
                point.location,
                point.type,
                point.terminalName,
                point.installDate,
                point.temporary,
                point.status
            );
        } catch (err) {
            throw (err);
        }
    }

    static async search(query: string) {
        return searchBikePoints(query);
    }

    static async closestTo(location: LatLongNum, count: number) {
        const locLat = location.latitude;
        const locLon = location.longitude;

        try {
            const allBikePoints = await getAllBikePoints();
            const allBikePointsWithDistances = await allBikePoints.map((el: any) => {
                //? Convert Mongoose document to JS Object
                el = el.toObject();

                const elLat = parseFloat(el.location.latitude);
                const elLon = parseFloat(el.location.longitude);
                const distanceMi = getDistanceBetweenLatLong(
                    { latitude: locLat, longitude: locLon },
                    { latitude: elLat, longitude: elLon });

                return {
                    distanceMi,
                    data: el
                };
            });
            allBikePointsWithDistances.sort((a: any, b: any) => {
                return a.distanceMi - b.distanceMi;
            })
            return allBikePointsWithDistances.slice(0, count);
        } catch (err) {
            throw (err);
        }
    }

    static async centrePoint(locations: LatLongNum[]) {
        return -1;
    }

    async getDistanceFromBikePoint(bikePointB: BikePoint) {
        return -1;
    }

    async getDistanceFromId(bikePointBId: string) {
        const bikePointB = await BikePoint.fromId(bikePointBId);
        return this.getDistanceFromBikePoint(bikePointB);
    }

    async getRoadDistanceFromBikePoint(bikePointB: BikePoint) {
        // todo: implement
        return new Promise((r, e) => e(-1));
    }
}