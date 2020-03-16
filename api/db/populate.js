require('dotenv').config();
const axios = require('axios').default;
const xml2js = require('xml2js');
const mongoose = require('mongoose');

const StationFactory = require('./schemas/Station.factory');

const KB_URL_AUTH = 'https://opendata.nationalrail.co.uk/authenticate';
const KB_URL_STATIONS = 'https://opendata.nationalrail.co.uk/api/staticfeeds/4.0/stations';

function populateStations() {
    // Get ready for chaining HELL
    return axios({
        method: 'post',
        url: KB_URL_AUTH,
        data: {
            username: process.env.ORD_USERNAME,
            password: process.env.ORD_PASSWORD
        }
    })
        .then((response) => {
            console.log("\tReceived authentication token");
            return response.data.token;
        })
        .then((token) => {
            console.log("Requesting Stations from NRE API - this will take over a minute.");
            return axios({
                method: 'get',
                url: KB_URL_STATIONS,
                headers: {
                    'X-Auth-Token': token
                }
            });
        })
        .then((response) => {
            console.log("Downloaded response from NRE API. Parsing...");
            return xml2js.parseStringPromise(response.data);
        })
        .then((result) => {
            console.log("\tParsed.");
            return result["StationList"]["Station"].map(raw => {
                return {
                    crs: raw["CrsCode"][0],
                    name: raw["Name"][0],
                    location: {
                        longitude: raw["Longitude"][0],
                        latitude: raw["Latitude"][0]
                    },
                    staffing: raw["Staffing"][0]["StaffingLevel"][0]
                };
            });
        })
        .then((data) => {
            // populate DB
            console.log("Populating database with results...");
            return Promise.all(data.map((station) => {
                return StationFactory.addStation(station);
            }));
        })
        .then((data) => {
            console.log("\tDone.");
        });
}

mongoose.connect(`mongodb://${process.env.DEPARTRDB_URL}/${process.env.DEPARTRDB_NAME}`, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', err => console.error(err));
db.on('open', () => {
    console.log("Database connected");

    console.log("\n\nPopulating stations\n\tThis will take a VERY LONG TIME. departr recommends a coffee while you wait.");
    populateStations()
        .then((stations) => {
            console.log("Population complete! departr is now ready for launch. Use 'yarn server' to launch the API.");
            db.close();
        })
        .catch((err) => {
            console.error(err.message);
            db.close();
        });
});