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
        return departrDB.getStationDetails(crs)
            .then((station) => {
                return new Station(
                    station.crs,
                    station.name,
                    station.location,
                    station.staffing
                );
            })
            .catch((err) => {
                console.error(err);
                return err;
            });
    }

    static async findNearest(location: LatLong, count: number) {
        const locLat = parseFloat(location.latitude);
        const locLon = parseFloat(location.longitude);

        return departrDB.getAllStationDetails()
            .then((stations) => {
                return stations.map(el => {
                    el = el.toObject();
                    const elLat = parseFloat(el.location.latitude);
                    const elLon = parseFloat(el.location.longitude);

                    // todo: move to separate helper functions file
                    function getDistanceBetweenLatLong(a: LatLongNum, b: LatLongNum) {
                        function deg2rad(deg) { return deg * (Math.PI / 180); }
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

                    let distanceMi = getDistanceBetweenLatLong(
                        { latitude: locLat, longitude: locLon },
                        { latitude: elLat, longitude: elLon });

                    return { distanceMi, data: el };
                });
            })
            .then((stationsWithDistance) => {
                stationsWithDistance.sort((a, b) => {
                    return a.distanceMi - b.distanceMi;
                });

                return stationsWithDistance;
            })
            .then((stationsWithDistance) => {
                //* returns: { distanceMi, data }
                return stationsWithDistance.slice(0, count);
            })
    }

    getDetails() {
        return this;
    }

    getName() {
        return this.name;
    }

    getLocation() {
        return this.location;
    }

    getStaffing() {
        return this.staffing;
    }

    getRoadDistanceFrom(station: Station) {
        // todo: implement
        return -1;
    }
}

module.exports = {
    Station
};