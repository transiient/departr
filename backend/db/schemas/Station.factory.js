import StationModel from './Station';
require('mongoose');

export function getStationFromCrs(crs) {
    return new Promise((resolve, reject) => {
        let query = StationModel.findOne({ crs: crs });
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

export function getAllStations() {
    return new Promise((resolve, reject) => {
        let query = StationModel.find({});
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

export function searchStations(query) {
    return new Promise((resolve, reject) => {
        let mongooseQuery = StationModel.find({
            $text: { $search: query }
        });
        mongooseQuery.exec((err, docs) => {
            if (err) return reject(err);
            return resolve(docs);
        });
    });
}

export function addStation(station) {
    return new Promise((resolve, reject) => {
        // todo: check station is correct before saving - adding types will be fine for this
        let newStation = new StationModel(station);

        return newStation.save((err, doc) => {
            if (err) return reject(err);
            resolve(doc);
        });
    });
}