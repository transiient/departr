import {
    SEARCH_STATION_STARTED,
    SEARCH_STATION_SUCCEEDED,
    SEARCH_STATION_FAILED
} from '../types';
import { API_URL } from '../../config';

const searchStarted = () => {
    return {
        type: SEARCH_STATION_STARTED
    }
}

const searchSucceeded = (results) => {
    return {
        type: SEARCH_STATION_SUCCEEDED,
        payload: results
    }
}

const searchFailed = (error) => {
    return {
        type: SEARCH_STATION_FAILED,
        payload: error
    }
}

// thunk Action Creator
export const searchStations = (query) => {
    return (dispatch) => {
        dispatch(searchStarted());

        // todo: use axios instead
        fetch(API_URL+'/station-search/train/' + query)
        .then((res) => {
            res.json().then((json) => {
            dispatch(searchSucceeded({query, results: json}));
        })})
        .catch((err) => {
            dispatch(searchFailed({query, error: err}));
        })
    }
}