const KnowledgeBaseAPI = require('../upstreamRequestHelpers/KnowledgeBaseAPI');
const kbAPI = new KnowledgeBaseAPI(process.env.ORD_USERNAME, process.env.ORD_PASSWORD);

interface StationLocation {
    longitude: string;
    latitude: string;
}

class Station {
    crs: string;
    name: string;
    location: StationLocation;
    staffing: string;

    constructor(
        crs: string,
        name: string,
        location: StationLocation,
        staffing: string
    ) {
        this.crs = crs;
        this.name = name;
        this.location = location;
        this.staffing = staffing;
    }

    static async fromCrs(crs: string) {
        console.log(crs);
        const station = await kbAPI.getStationDetails(crs);
        console.log("got" + station.crs);
        return new Station(
            station.crs,
            station.name,
            station.location,
            station.staffing
        );
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