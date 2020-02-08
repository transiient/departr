import { 
    UPDATE_STATION_DETAILS_STARTED,
    UPDATE_STATION_DETAILS_FAILED,
    UPDATE_STATION_DETAILS_SUCCEEDED
} from '../types';

const initialState = {
    isLoading: true,
    error: null,
    station: {}
}

export const stationDetailReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_STATION_DETAILS_STARTED:
            return {
                ...state,
                isLoading: true
            }
        case UPDATE_STATION_DETAILS_SUCCEEDED:
            return {
                ...state,
                isLoading: false,
                station: action.payload
            }
        case UPDATE_STATION_DETAILS_FAILED:
            return {
                ...state,
                isLoading: false,
                error: action.payload
            }
        default:
            return state;
    }
};