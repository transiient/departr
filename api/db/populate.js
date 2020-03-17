require('dotenv').config();
const axios = require('axios').default;
const xml2js = require('xml2js');
const mongoose = require('mongoose');

const StationFactory = require('./schemas/Station.factory');

const KB_URL_AUTH = 'https://opendata.nationalrail.co.uk/authenticate';
const KB_URL_STATIONS = 'https://opendata.nationalrail.co.uk/api/staticfeeds/4.0/stations';

function tidy(rawData) {
    return {
        crs: rawData["CrsCode"][0],
        name: rawData["Name"][0],
        location: {
            longitude: rawData["Longitude"][0],
            latitude: rawData["Latitude"][0]
        },
        staffing: rawData["Staffing"][0]["StaffingLevel"][0]
    };
}

async function populateStations() {
    // Get ready for chaining HELL
    try {
        const authToken = await axios({
            method: 'post',
            url: KB_URL_AUTH,
            data: {
                username: process.env.ORD_USERNAME,
                password: process.env.ORD_PASSWORD
            }
        }).then((res) => res.data.token);
        const stationsDataRaw = await axios({
            method: 'get',
            url: KB_URL_STATIONS,
            headers: {
                'X-Auth-Token': authToken
            }
        }).then((response) => xml2js.parseStringPromise(response.data));
        const stationsData = stationsDataRaw["StationList"]["Station"].map((raw) => tidy(raw));
        return Promise.all(stationsData.map((station) => StationFactory.addStation(station)));
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

console.log("Beginning population...");
mongoose.connect(`mongodb://${process.env.DEPARTRDB_URL}/${process.env.DEPARTRDB_NAME}`, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', err => console.error(err));
db.on('open', async () => {
    console.log("\tDatabase connection opened");

    console.log("\tPopulating stations\n\tThis will take a VERY LONG TIME. departr recommends a coffee while you wait.");
    try {
        const dbResult = await populateStations();
        console.log("\tDone!");
    } catch (err) {
        console.error("**\tAn error occurred and the database likely wasn't populated.");
        console.error(err);
    }
    console.log("\tClosing database connection");
    db.close();
});