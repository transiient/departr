console.clear();
console.log("\n\nLaunching departr API...\n");

import express, { Request as Req, Response as Res } from "express";

import departrDBAPI from "./upstreamRequestHelpers/departrDBAPI";
import LdbwsAPI from "./upstreamRequestHelpers/LdbwsAPI";

// Routes
import __RAILROUTES__ from "./routes/rail";
import __CYCLEROUTES__ from "./routes/bike";
import __BUSROUTES__ from "./routes/bus";
import __METROROUTES__ from "./routes/metro";
import __JOURNEYPLANNERROUTES__ from "./routes/journeyPlanner";
import __SEARCHROUTES__ from "./routes/search";
const ROUTES = {
    rail: __RAILROUTES__,
    cycle: __CYCLEROUTES__,
    bus: __BUSROUTES__,
    metro: __METROROUTES__,
    journeyPlanner: __JOURNEYPLANNERROUTES__,
    search: __SEARCHROUTES__,
};

console.log("\tSetting environment variables...");
require("dotenv").config();
console.log("\tInitialising express...");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

const {
    API_PORT,
    LDBWS_TOKEN,
    ORD_USERNAME,
    ORD_PASSWORD,
    DEPARTRDB_NAME,
    DEPARTRDB_URL,
} = process.env;

if (API_PORT === null || LDBWS_TOKEN === null || ORD_USERNAME === null || ORD_PASSWORD === null) {
    console.error("Required environment variable(s) not set");
    console.log("Please copy /example.env to /.env and insert the required environment variables.");
    console.log("   departr API cannot run without these variables set.");
}

console.log("\tRegistering LdbwsAPI...");
const ldbwsAPI = new LdbwsAPI(LDBWS_TOKEN || "");
console.log("\tConnecting to departr database asynchronously...");
const departrDB = new departrDBAPI(DEPARTRDB_URL || "", DEPARTRDB_NAME || "");

console.log("\tRegistering middleware...");
app.use(cors());
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
    ---- ROUTES ----
*/
app.get("/", (req: Req, res: Res) => {
    res.setHeader("Content-Type", "application/json");

    res.json({
        message: "departr API is live, and you're connected.",
        // "routes": [
        //     "/",
        //     "/rail/:crs/details",
        //     "/rail/:crs/services",
        //     "/search/:query"
        // ]
    });
});

ROUTES.rail(app, ldbwsAPI);
ROUTES.cycle(app);
ROUTES.bus(app);
ROUTES.metro(app);
ROUTES.journeyPlanner(app);
ROUTES.search(app, ldbwsAPI);

// Run app
app.listen(API_PORT, () => {
    console.log("\n>> API is running on port [" + API_PORT + "]");
});
