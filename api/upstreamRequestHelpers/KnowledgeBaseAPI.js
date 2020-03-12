const axios = require('axios').default;
// const xml2js = require('xml2js');
const fs = require('fs');
const fsPromises = require('fs').promises;

/*
    1. Get token from https://opendata.nationalrail.co.uk/authenticate (valid for 1hr)
    2. Make requests with this token
    3. if request returns Unauthorised, generate new token
    4. Make requests with new token

    requests:
        GET <api url>
            X-Auth-Token: < token from above >
        Unauthorised:
            { ...
                "message": "Unauthorised"
            }
*/

// Latest URLs from https://opendata.nationalrail.co.uk/feeds
const KB_URL_AUTH = 'https://opendata.nationalrail.co.uk/authenticate';
const KB_URL_STATIONS = 'https://opendata.nationalrail.co.uk/api/staticfeeds/4.0/stations';
const KB_URL_INCIDENTS = 'https://opendata.nationalrail.co.uk/api/staticfeeds/5.0/incidents';
const KB_URL_TIMETABLE = 'https://opendata.nationalrail.co.uk/api/staticfeeds/3.0/timetable';
const KB_URL_TOCS = 'https://opendata.nationalrail.co.uk/api/staticfeeds/4.0/tocs';

class KnowledgeBaseAPI {
    constructor(username, password, reloadStationsOnReload) {
        this.authCredentials = {
            username: username,
            password: password,
            token: {
                dateTime: Date.now(),
                success: false,
                token: ''
            }
        };

        this.authenticate();
    }

    /*
        authenticate()

        Returns a promise with the API token
    */
    authenticate() {
        return axios({
            url: KB_URL_AUTH,
            method: 'post',
            data: {
                username: this.authCredentials.username,
                password: this.authCredentials.password,
            }
        })
        .then((response) => {
            this.setAuthToken(response.data.token);
            return response.data.token;
        })
        .catch((error) => {
            console.error(error);
        });
    }

    setAuthToken(token) {
        this.authCredentials.token = {
            dateTime: Date.now(),
            success: true,
            token: token
        }
    }

    async getAuthToken() {
        // todo: refresh after 1hr from last token

        if (this.authCredentials.token !== '')
            return this.authCredentials.token;
        
        return this.authenticate;
    }

    readStationDetails() {
        // todo: use fsPromises
        return new Promise((resolve, reject) => {
            fs.readFile('./api/upstreamRequestHelpers/data/kb_response.json', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(data));
            });
        });
    }

    // todo: for now, just read directly from the file to get details
    // I may be able to optimise this later but for now this is the best we'll get
    // todo: use a local database for this info
    getStationDetails(crs) {
        return this.readStationDetails()
        .then(data => {
            const formattedStations = data.StationList.Station.map((station) => {
                return {
                    crs: station["CrsCode"][0],
                    name: station["Name"][0],
                    // address: station["Address"][0]["com:PostalAddress"],
                    location: {
                        longitude: station["Longitude"][0],
                        latitude: station["Latitude"][0]
                    },
                    staffing: station["Staffing"][0]["StaffingLevel"][0]
                }
            });
            return formattedStations.filter(station => station.crs.toLowerCase()===crs.toLowerCase())[0];
        })
        .catch((err) => console.error(err));
    }
}

module.exports = KnowledgeBaseAPI;