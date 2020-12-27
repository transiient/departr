import TOCModel from "./TOC";
require("mongoose");

export function getTOCFromName(name) {
    return new Promise((resolve, reject) => {
        let query = TOCModel.findOne({ name });
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

export function getAllTOCs() {
    return new Promise((resolve, reject) => {
        let query = TOCModel.find({});
        query.exec((err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
}

export function searchTOCs(query) {
    return new Promise((resolve, reject) => {
        let mongooseQuery = TOCModel.find({
            $text: { $search: query },
        });
        mongooseQuery.exec((err, docs) => {
            if (err) return reject(err);
            return resolve(docs);
        });
    });
}

export function addTOC(toc) {
    return new Promise((resolve, reject) => {
        // todo: check TOC is correct before saving
        // adding types will be fine for this
        let newTOC = new TOCModel(toc);

        return newTOC.save((err, doc) => {
            if (err) return reject(err);
            resolve(doc);
        });
    });
}
