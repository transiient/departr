const axios = require('axios').default;

const NOMINATIM_CANONICAL_URL = 'https://nominatim.openstreetmap.org/';

class NominatimAPI {
    static async getLatLongFromAddressSearch(query: string) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: `${NOMINATIM_CANONICAL_URL}search/${query}`,
                params: {
                    'format': 'json'
                }
            })
                .then((response: any) => {
                    if (response.data.length === 0)
                        return reject({ message: 'No results' });
                    const data = response.data[0];
                    return resolve({
                        latitude: data.lat,
                        longitude: data.lon
                    });
                })
                .catch((err: any) => reject(err));
        });
    }
}

export {
    NominatimAPI
}