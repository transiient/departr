require('dotenv').config();
const departrDBAPI = require('../upstreamRequestHelpers/departrDBAPI').departrDBAPI;
const departrDB = new departrDBAPI(process.env.DEPARTRDB_URL, process.env.DEPARTRDB_NAME);

interface LatLong {
    longitude: string;
    latitude: string;
}
interface LatLongNum {
    longitude: number;
    latitude: number;
}

function getDistanceBetweenLatLong(a: LatLongNum, b: LatLongNum) {
    function deg2rad(deg: number) { return deg * (Math.PI / 180); }
    const R_KM = 6371;
    const radLat = deg2rad(b.latitude - a.latitude);
    const radLon = deg2rad(b.longitude - a.longitude);
    const x =
        Math.sin(radLat / 2) * Math.sin(radLat / 2) +
        Math.cos(deg2rad(a.latitude)) * Math.cos(deg2rad(b.latitude)) *
        Math.sin(radLon / 2) * Math.sin(radLon / 2);
    const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    const z = R_KM * y;
    return z * 0.62137119;
}

class Station {
    crs: string;
    name: string;
    location: LatLong;
    staffing: string;

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
    }

    static async fromCrs(crs: string) {
        try {
            const station = await departrDB.getStationDetails(crs);

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
        return departrDB.searchStations(query);
    }

    static async findNearest(location: LatLong, count: number) {
        const locLat = parseFloat(location.latitude);
        const locLon = parseFloat(location.longitude);

        const allStations = await departrDB.getAllStationDetails();
        const allStationsWithDistances = allStations.map((el: any) => {
            //? Convert Mongoose document to JS Object
            el = el.toObject();

            const elLat = parseFloat(el.location.latitude);
            const elLon = parseFloat(el.location.longitude);
            const distanceMi = getDistanceBetweenLatLong(
                { latitude: locLat, longitude: locLon },
                { latitude: elLat, longitude: elLon });

            return { distanceMi, data: el };
        });
        allStationsWithDistances.sort((a: any, b: any) => {
            return a.distanceMi - b.distanceMi;
        })
        return allStationsWithDistances.slice(0, count);
    }

    getRoadDistanceFrom(station: Station) {
        // todo: implement
        return -1;
    }
}

export {
    Station
}