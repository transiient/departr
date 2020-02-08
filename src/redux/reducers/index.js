import { combineReducers } from 'redux';

import { searchReducer } from './searchReducer';
import { stationDetailReducer } from './stationReducer';

export const rootReducer = combineReducers({
    search: searchReducer,
    station: stationDetailReducer
});