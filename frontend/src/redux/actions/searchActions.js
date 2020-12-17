import axios from 'axios';
import {
    SEARCH_STATION_STARTED,
    SEARCH_STATION_SUCCEEDED,
    SEARCH_STATION_CANCELLED,
    SEARCH_STATION_FAILED
} from '../types';
import { API_URL } from '../../config';

const searchStarted = () => {
    return {
        type: SEARCH_STATION_STARTED
    };
};

const searchSucceeded = (results) => {
    return {
        type: SEARCH_STATION_SUCCEEDED,
        payload: results
    };
};

const searchCancelled = () => {
    return {
        type: SEARCH_STATION_CANCELLED
    };
};

const searchFailed = (error) => {
    return {
        type: SEARCH_STATION_FAILED,
        payload: error
    };
};

// thunk Action Creator
export const searchStations = (query) => {
    return async (dispatch) => {
        dispatch(searchStarted());

        try {
            const res = await axios.get(API_URL + '/train-station/search/' + query);
            dispatch(searchSucceeded({ query, results: res.data }));
        } catch (err) {
            dispatch(searchFailed({ query, error: err.message }));
        }
    };
};
export const searchStationsCancel = () => {
    return async (dispatch) => {
        dispatch(searchCancelled());
    };
};