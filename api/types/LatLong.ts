export interface LatLong {
    longitude: string;
    latitude: string;
}
export interface LatLongNum {
    longitude: number;
    latitude: number;
}

export function getDistanceBetweenLatLong(a: LatLongNum, b: LatLongNum) {
    function deg2rad(deg: number) { return deg * (Math.PI / 180); }
    const R_KM = 6371;
    const radLat = deg2rad(b.latitude - a.latitude);
    const radLon = deg2rad(b.longitude - a.longitude);
    const x =
        Math.sin(radLat / 2) * Math.sin(radLat / 2) +
        Math.cos(deg2rad(a.latitude)) * Math.cos(deg2rad(b.latitude)) *
        Math.sin(radLon / 2) * Math.sin(radLon / 2);
    const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    const z = R_KM * y;
    return z * 0.62137119;
}