const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BikePointSchema = new Schema({
    id: String,
    url: String,
    name: String,
    location: {
        latitude: String,
        longitude: String
    },
    type: String,
    terminalName: String,
    installDate: String,
    temporary: Boolean,
    status: {
        installed: Boolean,
        locked: Boolean,
        bikesAvailable: Number,
        docksAvailable: Number,
        docksTotal: Number,
    }
});

BikePointSchema.index({
    'name': 'text'
}, {
    weights: {
        name: 1
    }
});

export default mongoose.model('BikePoint', BikePointSchema);