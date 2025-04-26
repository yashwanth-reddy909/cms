import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notificationsList: [],
    loading: false,
    error: null,
    response: null
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        getNotificationsStart: (state) => {
            state.loading = true;
            state.error = null;
            state.response = null;
        },
        getNotificationsSuccess: (state, action) => {
            state.loading = false;
            state.notificationsList = action.payload;
            state.response = false;
        },
        getNotificationsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getNotificationsEmpty: (state) => {
            state.loading = false;
            state.response = true;
        },
        markNotificationAsReadSuccess: (state, action) => {
            const index = state.notificationsList.findIndex(
                notification => notification._id === action.payload._id
            );
            if (index !== -1) {
                state.notificationsList[index] = action.payload;
            }
        },
        deleteNotificationSuccess: (state, action) => {
            state.notificationsList = state.notificationsList.filter(
                notification => notification._id !== action.payload
            );
        }
    }
});

export const {
    getNotificationsStart,
    getNotificationsSuccess,
    getNotificationsFailure,
    getNotificationsEmpty,
    markNotificationAsReadSuccess,
    deleteNotificationSuccess
} = notificationSlice.actions;

export default notificationSlice.reducer; 