import PT from 'prop-types';

import { PTStation } from './Station.js';

export let PTService = PT.exact({
    serviceType: PT.string.isRequired,
    serviceID: PT.string.isRequired,
    retailServiceID: PT.string.isRequired,
    operator: PT.exact({
        name: PT.string.isRequired,
        code: PT.string.isRequired,
        homepageUrl: PT.string.isRequired
    }).isRequired,
    stationOrigin: PTStation.isRequired,
    stationDestination: PTStation.isRequired,
    cancelled: PT.bool.isRequired,
    time: PT.exact({
        scheduled: PT.string.isRequired,
        expected: PT.string.isRequired,
        onTime: PT.bool.isRequired
    }).isRequired,
    callingPoints: PT.arrayOf(PT.exact({
        station: PTStation.isRequired,
        cancelled: PT.bool.isRequired,
        time: PT.exact({
            scheduled: PT.string.isRequired,
            expected: PT.string.isRequired,
            onTime: PT.bool.isRequired
        }).isRequired
    }).isRequired).isRequired,
    direct: PT.bool.isRequired
});