import { Application as App, Request as Req, Response as Res } from 'express';

//todo: types
export default (app: App) => {
    app.get('/bus', (req: Req, res: Res) => {
        res.status(501).json({ "message": "Bus is not yet implemented." });
    })
}