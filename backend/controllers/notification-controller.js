const Notification = require('../models/notification');
const Student = require('../models/studentSchema');

// Create a new notification
const createNotification = async (req, res) => {
    try {
        const { title, details, studentId } = req.body;
        
        // Validate required fields
        if (!title || !details) {
            return res.status(400).json({ message: 'Title and details are required' });
        }
        
        // Create notification object
        const notification = new Notification({
            title,
            details,
            date: new Date(),
            studentId: studentId || null, // If studentId is provided, it's for a specific student, otherwise it's for all students
            read: false
        });
        
        // Save notification
        const savedNotification = await notification.save();
        
        res.status(201).json(savedNotification);
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error: error.message });
    }
};

// give me a sample curl command to create a notification
// curl -X POST http://localhost:3000/student/notification \
// -H "Content-Type: application/json" \
// -d '{"title": "Test Notification", "details": "This is a test notification", "studentId": "680538d5ff4712ddfaccaa44"}'


// Get all notifications
// const getAllNotifications = async (req, res) => {
//     try {
//         const notifications = await Notification.find().sort({ createdAt: -1 });
//         res.status(200).json(notifications);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching notifications', error: error.message });
//     }
// };

// Get notifications for a specific student
const getStudentNotifications = async (req, res) => {
    try {
        const studentId = req.params.id;
        console.log(studentId);
        
        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Get notifications for this student and general notifications (where studentId is null)
        const notifications = await Notification.find({
            $or: [
                { studentId: studentId },
                { studentId: null }
            ]
        }).sort({ createdAt: -1 });
        
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student notifications', error: error.message });
    }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;

        console.log(notificationId);
        
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
};

// Delete a notification
// extra feature
const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        
        const notification = await Notification.findByIdAndDelete(notificationId);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error: error.message });
    }
};

module.exports = {
    createNotification,
    // getAllNotifications,
    getStudentNotifications,
    markNotificationAsRead,
    deleteNotification
};
