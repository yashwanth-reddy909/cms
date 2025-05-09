const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notification = require('../models/notification.js');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const studentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
        });

        if (existingStudent) {
            res.send({ message: 'Roll Number already exists' });
        }
        else {
            const student = new Student({
                ...req.body,
                school: req.body.adminID,
                password: hashedPass
            });

            let result = await student.save();

            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            res.body.password = await bcrypt.hash(res.body.password, salt)
        }
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'text/plain' || 
            file.mimetype === 'application/pdf' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only TXT, PDF, and DOCX files are allowed.'));
        }
    }
}).array('files', 10); // Allow up to 10 files

// Function to extract text from files
const extractTextFromFile = async (filePath, fileType) => {
    try {
        if (fileType === 'text/plain') {
            return fs.readFileSync(filePath, 'utf8');
        } else if (fileType === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }
    } catch (error) {
        throw new Error(`Error reading ${fileType} file: ${error.message}`);
    }
};

const updateQuestionResult = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const subject = await Subject.findById(req.body.subName);
        if (!subject) {
            return res.send({ message: 'Subject not found' });
        }

        const existingResult = student.questionResult.find(
            (result) => result.subName.toString() === subject._id.toString()
        );
        
        if (existingResult) {
            existingResult.result = req.body.result;
        } else {
            student.questionResult.push({ subName: subject._id, result: req.body.result });
        }

        // Calculate total marks and create notification
        const totalMarks = req.body.result.reduce((sum, question) => sum + (question.marks || 0), 0);
        const totalQuestions = req.body.result.length;
        
        // Create notification for question results
        const notification = new Notification({
            title: 'Question Results Updated',
            details: `Your results for ${subject.subName} have been updated. You scored ${totalMarks} marks out of ${totalQuestions} questions.`,
            date: new Date(),
            studentId: student._id,
            read: false
        });

        await notification.save();
        const result = await student.save();
        return res.send(result);

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const updateQuestionResultWithFile = async (req, res) => {
    try {
        upload(req, res, async function(err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            const student = await Student.findById(req.params.id);
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            const subject = await Subject.findById(req.body.subName);
            if (!subject) {
                return res.status(404).json({ message: 'Subject not found' });
            }

            let results = [];
            
            // If files are uploaded
            if (req.files && req.files.length > 0) {
                // Parse questions from the request body
                const questions = JSON.parse(req.body.questions);
                
                // Check if number of files matches number of questions
                if (req.files.length !== questions.length) {
                    return res.status(400).json({ message: 'Number of files does not match number of questions' });
                }

                // Process each file and map to corresponding question
                for (let i = 0; i < req.files.length; i++) {
                    try {
                        const fileText = await extractTextFromFile(req.files[i].path, req.files[i].mimetype);
                        results.push({
                            question: questions[i],
                            answer: fileText
                        });
                    } catch (error) {
                        return res.status(500).json({ message: `Error processing file ${i + 1}: ${error.message}` });
                    }
                }
            } else if (req.body.result) {
                // Handle text input
                results = req.body.result;
            } else {
                return res.status(400).json({ message: 'No files or text answers provided' });
            }

            const existingResult = student.questionResult.find(
                (result) => result.subName.toString() === subject._id.toString()
            );

            if (existingResult) {
                existingResult.result = results;
            } else {
                student.questionResult.push({ subName: subject._id, result: results });
            }

            const savedStudent = await student.save();
            return res.send(savedStudent);
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const subject = await Subject.findById(subName);

        const existingAttendance = student.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString() &&
                a.subName.toString() === subName
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            // Check if the student has already attended the maximum number of sessions
            const attendedSessions = student.attendance.filter(
                (a) => a.subName.toString() === subName
            ).length;

            if (attendedSessions >= subject.sessions) {
                return res.send({ message: 'Maximum attendance limit reached' });
            }

            student.attendance.push({ date, status, subName });

            console.log(attendedSessions, subject.sessions);
            // Check if this was the last session
            if (attendedSessions + 1 == subject.sessions) {
                console.log("Last session");
                // Calculate attendance percentage
                const totalSessions = subject.sessions;
                const presentSessions = student.attendance.filter(
                    (a) => a.subName.toString() === subName && a.status === 'Present'
                ).length;
                const attendancePercentage = (presentSessions / totalSessions) * 100;

                // Create notification for completion
                const notification = new Notification({
                    title: 'Attendance Completion',
                    details: `You have completed all ${totalSessions} sessions for ${subject.subName}. Your attendance percentage is ${attendancePercentage.toFixed(2)}%.`,
                    date: new Date(),
                    studentId: student._id,
                    read: false
                });

                await notification.save();
            }
            // Check if half of the sessions are completed
            else if (attendedSessions + 1 === Math.ceil(subject.sessions / 2)) {
                console.log("Half sessions completed");
                // Calculate attendance percentage for half sessions
                const totalSessions = subject.sessions;
                const presentSessions = student.attendance.filter(
                    (a) => a.subName.toString() === subName && a.status === 'Present'
                ).length;
                const attendancePercentage = (presentSessions / (attendedSessions + 1)) * 100;

                // Create notification for half completion
                const halfNotification = new Notification({
                    title: 'Half Sessions Completed',
                    details: `You have completed ${attendedSessions + 1} out of ${totalSessions} sessions for ${subject.subName}. Your current attendance percentage is ${attendancePercentage.toFixed(2)}%.`,
                    date: new Date(),
                    studentId: student._id,
                    read: false
                });

                await halfNotification.save();
            }
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id

    try {
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,

    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    updateQuestionResult,
    updateQuestionResultWithFile,
};