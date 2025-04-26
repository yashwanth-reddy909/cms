import axios from 'axios';
import { 
    getNotificationsStart, 
    getNotificationsSuccess, 
    getNotificationsFailure, 
    getNotificationsEmpty,
    markNotificationAsReadSuccess,
    deleteNotificationSuccess
} from './notificationSlice';

const baseURL = 'http://localhost:5000';

// Get all notifications for a student
export const getStudentNotifications = (studentId) => async (dispatch) => {
    try {
        dispatch(getNotificationsStart());
        const response = await axios.get(`${baseURL}/student/notifications/${studentId}`);
        
        if (response.data.length === 0) {
            dispatch(getNotificationsEmpty());
        } else {
            dispatch(getNotificationsSuccess(response.data));
        }
    } catch (error) {
        dispatch(getNotificationsFailure(error.response?.data?.message || 'Failed to fetch notifications'));
    }
};

// Mark a notification as read
export const markNotificationAsRead = (notificationId) => async (dispatch) => {
    try {
        const response = await axios.put(`${baseURL}/student/notification/${notificationId}/read`);
        dispatch(markNotificationAsReadSuccess(response.data));
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
};

// Delete a notification
export const deleteNotification = (notificationId) => async (dispatch) => {
    try {
        await axios.delete(`${baseURL}/student/notification/${notificationId}`);
        dispatch(deleteNotificationSuccess(notificationId));
    } catch (error) {
        console.error('Failed to delete notification:', error);
    }
}; 