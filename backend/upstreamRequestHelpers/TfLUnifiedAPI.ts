import axios from 'axios';
import BikePoint from '../types/Bike/BikePoint';

const API_URL = "https://api.tfl.gov.uk/bikepoint";

export class TfLBikePointAPI {
    authCredentials: {
        appId: string,
        token: string
    }

    constructor(TFL_APPID: string, TFL_TOKEN: string) {
        this.authCredentials = {
            appId: TFL_APPID,
            token: TFL_TOKEN
        };
    }

    static async getBikePointFromId(id: string): Promise<BikePoint> {
        try {
            const bikePoints = await this.getAllBikePoints();
            return bikePoints.filter((bikePoint: BikePoint) => bikePoint.id === id)[0];
        } catch (err) {
            throw (err);
        }
    }

    async getAllBikePoints(): Promise<BikePoint[]> {
        try {
            const tflResponse = await axios({
                method: 'get',
                url: API_URL,
                params: {
                    app_id: this.authCredentials.appId,
                    app_key: this.authCredentials.token
                }
            });

            return Promise.all(tflResponse.data.map((point: any) => {
                const getProperty = (propertyName: string): string => {
                    return point.additionalProperties.filter((k: any) => k.key === propertyName)[0].value;
                }

                return new BikePoint(
                    point.id,
                    point.url,
                    point.commonName,
                    {
                        latitude: point.lat.toString(),
                        longitude: point.lon.toString()
                    },
                    point.placeType,
                    getProperty("TerminalName"),
                    getProperty("InstallDate"),
                    getProperty("Temporary") === "true",
                    {
                        installed: getProperty("Installed") === "true",
                        locked: getProperty("Locked") === "true",
                        bikesAvailable: parseInt(getProperty("NbBikes")),
                        docksAvailable: parseInt(getProperty("NbEmptyDocks")),
                        docksTotal: parseInt(getProperty("NbDocks"))
                    }
                );
            }));
        } catch (err) {
            throw (err);
        }
    }
}