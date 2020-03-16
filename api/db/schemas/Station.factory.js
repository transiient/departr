require('mongoose');
const Station = require('./Station').StationModel;

function getStationFromCrs(crs) {
    return new Promise((resolve, reject) => {
        let query = Station.findOne({ crs: crs });
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

function getAllStations() {
    return new Promise((resolve, reject) => {
        let query = Station.find({});
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

function searchStations(query) {
    return new Promise((resolve, reject) => {
        let mongooseQuery = Station.find({
            $text: { $search: query }
        });
        mongooseQuery.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

function addStation(station) {
    return new Promise((resolve, reject) => {
        let newStation = new Station({
            crs: station.crs,
            name: station.name,
            location: station.location,
            staffing: station.staffing
        });

        return newStation.save((err, doc) => {
            if (err) return reject(err);
            resolve(doc);
        });
    });
}

module.exports = {
    getStationFromCrs,
    getAllStations,
    searchStations,
    addStation
};