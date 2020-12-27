require("dotenv").config();
const axios = require("axios").default;
const xml2js = require("xml2js");
const mongoose = require("mongoose");

const StationFactory = require("./schemas/Station.factory");

const KB_URL_AUTH = "https://opendata.nationalrail.co.uk/authenticate";
const KB_URL_STATIONS = "https://opendata.nationalrail.co.uk/api/staticfeeds/4.0/stations";

function tidy(rawData) {
    return rawData.map((raw) => ({
        crs: raw["CrsCode"][0],
        name: raw["Name"][0],
        location: {
            longitude: raw["Longitude"][0],
            latitude: raw["Latitude"][0],
        },
        staffing: raw["Staffing"][0]["StaffingLevel"][0],
    }));
}

async function populateStations() {
    try {
        const authToken = await axios({
            method: "post",
            url: KB_URL_AUTH,
            data: {
                username: process.env.ORD_USERNAME,
                password: process.env.ORD_PASSWORD,
            },
        }).then((res) => res.data.token);
        const stationsDataRaw = await axios({
            method: "get",
            url: KB_URL_STATIONS,
            headers: {
                "X-Auth-Token": authToken,
            },
        }).then((response) => xml2js.parseStringPromise(response.data));
        const stationsData = tidy(stationsDataRaw["StationList"]["Station"]);
        return Promise.all(stationsData.map((station) => StationFactory.addStation(station)));
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

console.log("Beginning population...");
mongoose.connect(`mongodb://${process.env.DEPARTRDB_URL}/${process.env.DEPARTRDB_NAME}`, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.on("open", async () => {
    console.log("\tDatabase connection opened");

    console.log(
        "\tPopulating stations\n\tThis will take a VERY LONG TIME. departr recommends a coffee while you wait."
    );
    try {
        await populateStations();
        console.log("Done!");
    } catch (err) {
        console.error(
            "**\tAn error occurred and the database likely wasn't populated correctly. Try again, or double-check your environment variables."
        );
        console.error(err);
    }
    console.log("\tClosing database connection");
    db.close();
});
