import BikePointModel from './BikePoint';
import BikePoint from '../../types/Bike/BikePoint';
require('mongoose');

// todo: types to replace "any"

export function getBikePointFromId(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
        let query = BikePointModel.findOne({ id: id });
        query.exec((err: any, data: any) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

export function getAllBikePoints(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let query = BikePointModel.find({});
        query.exec((err: any, data: any) => {
            if (err) return reject(err);
            return resolve(data || []);
        })
    })
}

export function searchBikePoints(query: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let mongooseQuery = BikePointModel.find({
            $text: { $search: query }
        });
        mongooseQuery.exec((err: any, data: any) => {
            if (err) return reject(err);
            return resolve(data || []);
        });
    })
}

export function addBikePoint(bikePoint: BikePoint): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let oldDocument = await getBikePointFromId(bikePoint.id);

        const newBikePoint = Object.assign(bikePoint, { storedAt: Date.now() });

        if (oldDocument) {
            oldDocument.overwrite(newBikePoint);
            oldDocument.save((err: any, doc: any) => {
                if (err) return reject(err);
                resolve(doc);
            });
        } else {
            const newBikePointModel = new BikePointModel(newBikePoint);
            newBikePointModel.save((err: any, doc: any) => {
                if (err) return reject(err);
                resolve(doc);
            });
        }
    });
}