import axios from 'axios';

import { 
    UPDATE_STATION_DETAILS_STARTED,
    UPDATE_STATION_DETAILS_FAILED,
    UPDATE_STATION_DETAILS_SUCCEEDED,
    UPDATE_STATION_SERVICES_STARTED,
    UPDATE_STATION_SERVICES_FAILED,
    UPDATE_STATION_SERVICES_SUCCEEDED
} from '../types';
import { API_URL } from '../../config';

// actual actions
const updateStationDetailsStarted = () => {
    return {
        type: UPDATE_STATION_DETAILS_STARTED,
    }
}
const updateStationDetailsSucceeded = (station) => {
    return {
        type: UPDATE_STATION_DETAILS_SUCCEEDED,
        payload: station
    }
}
const updateStationDetailsFailed = (error) => {
    return {
        type: UPDATE_STATION_DETAILS_FAILED,
        payload: error
    }
}
const updateStationServicesStarted = () => {
    return {
        type: UPDATE_STATION_SERVICES_STARTED,
    }
}
const updateStationServicesSucceeded = (services) => {
    return {
        type: UPDATE_STATION_SERVICES_SUCCEEDED,
        payload: services
    }
}
const updateStationServicesFailed = (error) => {
    return {
        type: UPDATE_STATION_SERVICES_FAILED,
        payload: error
    }
}

// thunk Action Creator
export const updateStationDetails = (crs) => {
    return (dispatch) => {
        dispatch(updateStationDetailsStarted());

        axios.get(API_URL+'/train-station/details/' + crs)
        .then((res) => {
            dispatch(updateStationDetailsSucceeded(res.data));
        })
        .catch((err) => {
            dispatch(updateStationDetailsFailed(err));
        })
    }
}
export const updateStationServices = (crs) => {
    return (dispatch) => {
        dispatch(updateStationServicesStarted());

        axios.get(API_URL+'/train-station/services/' + crs)
        .then((res) => {
            dispatch(updateStationServicesSucceeded(res.data));
        })
        .catch((err) => {
            console.log(err);
            dispatch(updateStationServicesFailed(err));
        })
    }
}