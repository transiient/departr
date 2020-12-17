import { Application as App, Request as Req, Response as Res } from 'express';
import Station from '../types/Train/Station';
import LdbwsAPI from '../upstreamRequestHelpers/LdbwsAPI';

//todo: types
export default (app: App, ldbwsAPI: LdbwsAPI) => {
    //* Station details
    app.get('/train/:crs/details', async (req: Req, res: Res) => {
        res.setHeader('Content-Type', 'application/json');

        try {
            const station = await Station.fromCrs(req.params.crs);
            res.json(station);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ "message": err.message });
        }
    });

    //* Station services
    app.get('/train/:crs/services', async (req: Req, res: Res) => {
        res.setHeader('Content-Type', 'application/json');

        try {
            const services = await ldbwsAPI.getDepartures(req.params.crs);
            res.json(services);
        } catch (err) {
            console.error(err);
            if (err.message === 'soap:Server: Unexpected server error') {
                res.status(404).json({ "message": "This station likely does not exist" });
            } else {
                console.error(err.message);
                res.status(500).json({ "message": err.message });
            }
        }
    });
}