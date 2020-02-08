import {
    SEARCH_STATION_FAILED,
    SEARCH_STATION_STARTED,
    SEARCH_STATION_SUCCEEDED
} from '../types';

const initialState = {
    isLoading: false,
    error: null,
    results: []
};

// Reducer return is the new state

export const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEARCH_STATION_STARTED:
            return {
                ...state,
                isLoading: true
            }
        case SEARCH_STATION_SUCCEEDED:
            return {
                ...state,
                isLoading: false,
                query: action.payload.query,
                results: action.payload.results
            }
        case SEARCH_STATION_FAILED:
            return {
                ...state,
                isLoading: false,
                query: action.payload.query,
                error: action.payload.error
            }
        default:
            return state;
    }
}