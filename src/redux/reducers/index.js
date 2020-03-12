import { combineReducers } from 'redux';

import { searchReducer } from './searchReducer';
import { stationDetailsReducer, stationServicesReducer } from './stationReducer';

export const rootReducer = combineReducers({
    search: searchReducer,
    station: combineReducers({
        station: stationDetailsReducer,
        services: stationServicesReducer
    })
});