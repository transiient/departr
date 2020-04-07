import {
    getAllStations,
    getStationFromCrs,
    searchStations
} from '../../db/schemas/Station.factory';
import {
    LatLong,
    LatLongNum,
    getDistanceBetweenLatLong
} from '../LatLong';
require('dotenv').config();

export default class Station {
    crs: string;
    name: string;
    location: LatLong;
    staffing: string;
    distanceMi: number;

    constructor(
        crs: string,
        name: string,
        location: LatLong,
        staffing: string
    ) {
        this.crs = crs;
        this.name = name;
        this.location = location;
        this.staffing = staffing;
        this.distanceMi = 0;
    }

    static async fromCrs(crs: string) {
        try {
            const station = await getStationFromCrs(crs);

            return new Station(
                station.crs,
                station.name,
                station.location,
                station.staffing
            );
        } catch (err) {
            throw (err);
        }
    }

    // todo: determine if this could be removed and simply replaced by this.fromCrs()
    static async exists(crs: string) {
        try {
            await this.fromCrs(crs);
            return true;
        } catch (err) {
            return false;
        }
    }

    static async search(query: string) {
        return searchStations(query);
    }

    static async closestTo(location: LatLongNum, count: number) {
        const locLat = location.latitude;
        const locLon = location.longitude;

        try {
            const allStations = await getAllStations();
            const allStationsWithDistances = await allStations.map((el: any) => {
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
            allStationsWithDistances.sort((a: any, b: any) => {
                return a.distanceMi - b.distanceMi;
            })
            return allStationsWithDistances.slice(0, count);
        } catch (err) {
            throw (err);
        }
    }

    static async centrePoint(locations: LatLongNum[]) {
        return -1;
    }

    async getDistanceFromStation(stationB: Station): Promise<number> {
        const stationALoc = {
            latitude: parseFloat(this.location.latitude),
            longitude: parseFloat(this.location.longitude)
        }
        const stationBLoc = {
            latitude: parseFloat(stationB.location.latitude),
            longitude: parseFloat(stationB.location.longitude)
        }

        return new Promise((r, e) => r(getDistanceBetweenLatLong(stationALoc, stationBLoc)));
    }

    async getDistanceFromCrs(stationBCrs: string) {
        const stationB = await Station.fromCrs(stationBCrs)
        return this.getDistanceFromStation(stationB);
    }

    async getRoadDistanceFromStation(stationB: Station) {
        // todo: implement
        return new Promise((r, e) => e(-1));
    }
}