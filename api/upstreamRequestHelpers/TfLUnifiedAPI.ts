import axios from 'axios';
import BikePoint from '../types/Bike/BikePoint';

const API_URL = "https://api.tfl.gov.uk/bikepoint";

export class TfLBikePointAPI {
    authCredentials: Object

    constructor() {
        this.authCredentials = {};
    }

    static async getBikePointFromId(id: string): Promise<BikePoint> {
        try {
            const bikePoints = await TfLBikePointAPI.getBikePoints();
            return bikePoints.filter((bikePoint) => bikePoint.id === id)[0];
        } catch (err) {
            throw (err);
        }
    }

    static async getBikePoints(): Promise<BikePoint[]> {
        try {
            const tflResponse = await axios({
                method: 'get',
                url: API_URL,
                params: {}
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