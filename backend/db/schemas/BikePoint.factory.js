import BikePointModel from "./BikePoint";
require("mongoose");

export function getBikePointFromId(id) {
    return new Promise((resolve, reject) => {
        let query = BikePointModel.findOne({ id: id });
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

export function getAllBikePoints() {
    return new Promise((resolve, reject) => {
        let query = BikePointModel.find({});
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data || []);
        });
    });
}

export function searchBikePoints(query) {
    return new Promise((resolve, reject) => {
        let mongooseQuery = BikePointModel.find({
            $text: { $search: query },
        });
        mongooseQuery.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data || []);
        });
    });
}

export function addBikePoint(bikePoint) {
    return new Promise(async (resolve, reject) => {
        let oldDocument = await getBikePointFromId(bikePoint.id);

        const newBikePoint = Object.assign(bikePoint, { storedAt: Date.now() });

        if (oldDocument) {
            oldDocument.overwrite(newBikePoint);
            oldDocument.save((err, doc) => {
                if (err) return reject(err);
                resolve(doc);
            });
        } else {
            const newBikePointModel = new BikePointModel(newBikePoint);
            newBikePointModel.save((err, doc) => {
                if (err) return reject(err);
                resolve(doc);
            });
        }
    });
}
