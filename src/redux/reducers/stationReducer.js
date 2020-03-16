import {
    UPDATE_STATION_DETAILS_STARTED,
    UPDATE_STATION_DETAILS_FAILED,
    UPDATE_STATION_DETAILS_SUCCEEDED,
    UPDATE_STATION_SERVICES_STARTED,
    UPDATE_STATION_SERVICES_FAILED,
    UPDATE_STATION_SERVICES_SUCCEEDED
} from '../types';

const initialState_stationDetails = {
    isLoading: true,
    error: null,
    station: {}
};
const initialState_stationServices = {
    isLoading: true,
    error: null,
    services: {}
};

export const stationDetailsReducer = (state = initialState_stationDetails, action) => {
    switch (action.type) {
        case UPDATE_STATION_DETAILS_STARTED:
            return {
                ...state,
                isLoading: true
            };
        case UPDATE_STATION_DETAILS_SUCCEEDED:
            return {
                ...state,
                isLoading: false,
                station: action.payload
            };
        case UPDATE_STATION_DETAILS_FAILED:
            return {
                ...state,
                isLoading: false,
                error: action.payload
            };
        default:
            return state;
    }
};
export const stationServicesReducer = (state = initialState_stationServices, action) => {
    switch (action.type) {
        case UPDATE_STATION_SERVICES_STARTED:
            return {
                ...state,
                isLoading: true
            };
        case UPDATE_STATION_SERVICES_SUCCEEDED:
            return {
                ...state,
                isLoading: false,
                services: action.payload
            };
        case UPDATE_STATION_SERVICES_FAILED:
            return {
                ...state,
                isLoading: false,
                error: action.payload
            };
        default:
            return state;
    }
};