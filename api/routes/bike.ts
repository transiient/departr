import { Application as App, Request as Req, Response as Res } from 'express';
import BikePoint from '../types/Bike/BikePoint';

//todo: types
export default (app: App) => {
    app.get('/bikepoint/tfl/:bikePointId', async (req: Req, res: Res) => {
        res.setHeader('Content-Type', 'application/json');

        try {
            let bikePoint = await BikePoint.fromId(req.params.bikePointId);
            res.json(bikePoint);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ "message": err.message });
        }
    });
}