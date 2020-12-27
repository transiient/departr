import RailStationModel from "./RailStation";
require("mongoose");

export function getRailStationFromCrs(crs) {
    return new Promise((resolve, reject) => {
        let query = RailStationModel.findOne({ crs: crs });
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

export function getAllRailStations() {
    return new Promise((resolve, reject) => {
        let query = RailStationModel.find({});
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

export function searchRailStations(query) {
    return new Promise((resolve, reject) => {
        let mongooseQuery = RailStationModel.find({
            $text: { $search: query },
        });
        mongooseQuery.exec((err, docs) => {
            if (err) return reject(err);
            return resolve(docs);
        });
    });
}

export function addRailStation(station) {
    return new Promise((resolve, reject) => {
        // todo: check station is correct before saving - adding types will be fine for this
        let newStation = new RailStationModel(station);

        return newStation.save((err, doc) => {
            if (err) return reject(err);
            resolve(doc);
        });
    });
}
