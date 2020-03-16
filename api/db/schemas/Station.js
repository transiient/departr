const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StationSchema = new Schema({
    crs: String,
    name: String,
    location: {
        longitude: String,
        latitude: String
    },
    staffing: String
});

const StationModel = mongoose.model('Station', StationSchema);

module.exports = {
    StationModel
};