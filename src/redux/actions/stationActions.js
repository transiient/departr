import axios from 'axios';

import { 
    UPDATE_STATION_DETAILS_STARTED,
    UPDATE_STATION_DETAILS_FAILED,
    UPDATE_STATION_DETAILS_SUCCEEDED
} from '../types';
import { API_URL } from '../../config';

// actual actions
const updateStationDetailsStarted = () => {
    return {
        type: UPDATE_STATION_DETAILS_STARTED,
    }
}
const updateStationDetailsSucceeded = (stationDetails) => {
    return {
        type: UPDATE_STATION_DETAILS_SUCCEEDED,
        payload: stationDetails
    }
}
const updateStationDetailsFailed = (error) => {
    return {
        type: UPDATE_STATION_DETAILS_FAILED,
        payload: error
    }
}

// thunk Action Creator
export const updateStationDetails = (queryCrs) => {
    return (dispatch) => {
        dispatch(updateStationDetailsStarted());

        axios.get(API_URL+'/station-detail/train/' + queryCrs)
        .then((res) => {
            dispatch(updateStationDetailsSucceeded(res.data));
        })
        .catch((err) => {
            dispatch(updateStationDetailsFailed(err));
        })
    }
}