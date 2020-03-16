import PT from 'prop-types';

export let PTStation = PT.exact({
    name: PT.string.isRequired,
    crs: PT.string.isRequired,
    location: PT.exact({
        longitude: PT.string.isRequired,
        latitude: PT.string.isRequired
    }),
    staffing: PT.string.isRequired
});