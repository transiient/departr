import { Application as App, Request as Req, Response as Res } from 'express';
import BikePoint from '../types/Bike/BikePoint';

//todo: types
export default (app: App) => {
    app.get('/journey', async (req: Req, res: Res) => {
        res.setHeader('Content-Type', 'application/json');

        res.status(501).json({ message: "Not yet implemented" });
    });

    app.get('/journey/:from/to/:to', async (req: Req, res: Res) => {
        res.setHeader('Content-Type', 'application/json');

        res.status(501).json({ message: "Not yet implemented" });
    });
}