import { Application as App, Request as Req, Response as Res } from 'express';

//todo: types
export default (app: App) => {
    app.get('/metro', (req: Req, res: Res) => {
        res.status(501).json({ "message": "Metro is not yet implemented." });
    })
}