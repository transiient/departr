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

// thunk Action Creator
export const updateStationDetails = (queryCrs) => {
    return (dispatch) => {
        dispatch(updateStationDetailsStarted());

        // todo: use axios instead
        fetch(API_URL+'/station-detail/train/' + queryCrs)
        .then((res) => {
            res.json().then((json) => {
            dispatch(updateStationDetailsSucceeded(json));
        })})
        .catch((err) => {
            dispatch(updateStationDetailsFailed(err));
        })
    }
}