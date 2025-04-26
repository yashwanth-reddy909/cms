import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentNotifications, markNotificationAsRead, deleteNotification } from '../redux/notificationRelated/notificationHandle';
import { Paper, Typography, Box, IconButton, Divider, Badge, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';

const SeeNotification = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { notificationsList, loading, error, response } = useSelector((state) => state.notification);
    const [selectedNotification, setSelectedNotification] = useState(null);

    useEffect(() => {
        if (currentUser && currentUser._id) {
            dispatch(getStudentNotifications(currentUser._id));
        }
    }, [dispatch, currentUser]);

    const handleMarkAsRead = (notificationId) => {
        dispatch(markNotificationAsRead(notificationId));
    };

    const handleDelete = (notificationId) => {
        dispatch(deleteNotification(notificationId));
    };

    const handleNotificationClick = (notification) => {
        setSelectedNotification(notification);
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (date.toString() === "Invalid Date") {
            return "Invalid Date";
        }
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (error) {
        console.log(error);
    }

    return (
        <div style={{ marginTop: '50px', marginRight: '20px', marginLeft: '20px' }}>
            {loading ? (
                <div style={{ fontSize: '20px' }}>Loading...</div>
            ) : response ? (
                <div style={{ fontSize: '20px' }}>No Notifications to Show Right Now</div>
            ) : (
                <>
                    <h3 style={{ fontSize: '30px', marginBottom: '40px' }}>Notifications</h3>

                    <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
                        {Array.isArray(notificationsList) && notificationsList.length > 0 ? (
                            notificationsList.map((notification) => (
                                <Box 
                                    key={notification._id} 
                                    sx={{ 
                                        p: 2, 
                                        cursor: 'pointer',
                                        backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" component="div">
                                                {notification.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {notification.details}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                {formatDate(notification.date)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {!notification.read && (
                                                <Tooltip title="Mark as read">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification._id);
                                                        }}
                                                    >
                                                        <CheckCircleIcon color="primary" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Delete">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(notification._id);
                                                    }}
                                                >
                                                    <DeleteIcon color="error" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ mt: 2 }} />
                                </Box>
                            ))
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body1">No notifications available</Typography>
                            </Box>
                        )}
                    </Paper>

                    {selectedNotification && (
                        <Paper sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h5" gutterBottom>
                                {selectedNotification.title}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {selectedNotification.details}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDate(selectedNotification.date)}
                            </Typography>
                        </Paper>
                    )}
                </>
            )}
        </div>
    );
};

export default SeeNotification;
