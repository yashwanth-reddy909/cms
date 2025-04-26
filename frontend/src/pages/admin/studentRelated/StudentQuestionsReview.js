import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';
import { Box, Typography, Paper, Divider, CircularProgress, Container, Alert, TextField, Button, Grid } from '@mui/material';
import { BlueButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';
import axios from 'axios';

const StudentQuestionsReview = ({ situation }) => {
    const dispatch = useDispatch();
    const { subjectsList } = useSelector((state) => state.sclass);
    const { userDetails, loading } = useSelector((state) => state.user);
    const { subjectDetails, subloading } = useSelector((state) => state.sclass);
    const { response, error, statestatus } = useSelector((state) => state.student);

    const params = useParams()
    const { studentID, subjectID } = params

    const [marks, setMarks] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [plagiarismResults, setPlagiarismResults] = useState({});
    const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

    useEffect(() => {
        dispatch(getUserDetails(studentID, "Student"));
        dispatch(getSubjectDetails(subjectID, "Subject"));
    }, [dispatch, studentID, subjectID]);
    
    // Find the student's question results for this subject
    const studentQuestionResults = userDetails?.questionResult?.find(
        result => result.subName === subjectID
    );

    // Check if student has submitted answers
    const hasSubmittedAnswers = studentQuestionResults && studentQuestionResults.result && studentQuestionResults.result.length > 0;
    
    // Check if answers are already graded
    const isGraded = hasSubmittedAnswers && studentQuestionResults.result.every(item => item.marks !== undefined);
    
    // Initialize marks state when student results are loaded
    useEffect(() => {
        if (hasSubmittedAnswers) {
            const initialMarks = studentQuestionResults.result.map(item => item.marks || "");
            setMarks(initialMarks);
        }
    }, [hasSubmittedAnswers, studentQuestionResults]);

    // Handle mark change for a specific question
    const handleMarkChange = (index, value) => {
        const newMarks = [...marks];
        newMarks[index] = value;
        setMarks(newMarks);
    };

    // Submit grades
    const handleSubmitGrades = () => {
        setLoader(true);
        
        // Check if all questions have marks
        if (marks.some(mark => mark === "")) {
            setLoader(false);
            setMessage("Please provide marks for all questions");
            setShowPopup(true);
            return;
        }
        
        // Prepare the updated result with marks
        const updatedResult = studentQuestionResults.result.map((item, index) => ({
            ...item,
            marks: marks[index]
        }));
        
        // Prepare the fields to update
        const fields = {
            subName: subjectID,
            result: updatedResult
        };
        
        // Dispatch the update action
        dispatch(updateStudentFields(studentID, fields, "UpdateQuestionResult"));
    };

    // Handle response from the update action
    useEffect(() => {
        if (response) {
            setLoader(false);
            setShowPopup(true);
            setMessage(response);
        } else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Error occurred while updating grades");
        } else if (statestatus === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Grades submitted successfully");
        }
    }, [response, statestatus, error]);

    // Check plagiarism for a specific answer
    const checkPlagiarism = async (index) => {
        if (isGraded) {
            setMessage("Cannot check plagiarism for already graded answers");
            setShowPopup(true);
            return;
        }

        setCheckingPlagiarism(true);
        setSelectedQuestionIndex(index);
        
        try {
            const answer = studentQuestionResults.result[index].answer;
            
            // Call the plagiarism API
            const response = await axios.post('http://localhost:5000/plagiarism', {
                text: answer
            });
            
            setPlagiarismResults(prev => ({
                ...prev,
                [index]: response.data
            }));
            
        } catch (error) {
            console.error('Plagiarism check error:', error);
            setMessage("Error checking for plagiarism: " + (error.response?.data?.error || error.message));
            setShowPopup(true);
        } finally {
            setCheckingPlagiarism(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {loading || subloading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Typography variant="h4" gutterBottom>
                        Student Questions Review
                    </Typography>
                    
                    {userDetails && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Student Information
                            </Typography>
                            <Typography variant="body1">
                                Name: {userDetails.name}
                            </Typography>
                            <Typography variant="body1">
                                Roll Number: {userDetails.rollNum}
                            </Typography>
                            <Typography variant="body1">
                                Class: {userDetails.sclassName?.sclassName}
                            </Typography>
                        </Paper>
                    )}

                    {subjectDetails && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Subject Information
                            </Typography>
                            <Typography variant="body1">
                                Subject: {subjectDetails.subName}
                            </Typography>
                            <Typography variant="body1">
                                Subject Code: {subjectDetails.subCode}
                            </Typography>
                        </Paper>
                    )}

                    {!hasSubmittedAnswers ? (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            This student has not yet submitted answers for this subject.
                        </Alert>
                    ) : (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Student Answers
                            </Typography>
                            
                            {studentQuestionResults.result.map((item, index) => (
                                <Box key={index} sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Question {index + 1}:
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        {item.question}
                                    </Typography>
                                    
                                    <Box sx={{ ml: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                        <Typography variant="body1">
                                            {item.answer}
                                        </Typography>
                                    </Box>
                                    
                                    {!isGraded && (
                                        <>
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="body2" gutterBottom>
                                                    Grade:
                                                </Typography>
                                                <TextField
                                                    type="number"
                                                    label="Marks"
                                                    value={marks[index] || ""}
                                                    onChange={(e) => handleMarkChange(index, e.target.value)}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    sx={{ width: '150px' }}
                                                />
                                            </Box>
                                            
                                            <Box sx={{ mt: 2 }}>
                                                <Button 
                                                    variant="outlined" 
                                                    color="secondary"
                                                    onClick={() => checkPlagiarism(index)}
                                                    disabled={checkingPlagiarism && selectedQuestionIndex === index}
                                                >
                                                    {checkingPlagiarism && selectedQuestionIndex === index ? (
                                                        <CircularProgress size={24} />
                                                    ) : (
                                                        "Check for Plagiarism"
                                                    )}
                                                </Button>
                                            </Box>
                                            
                                            {plagiarismResults[index] && (
                                                <Paper sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Plagiarism Analysis:
                                                    </Typography>
                                                    
                                                    {plagiarismResults[index].total_matches > 0 ? (
                                                        <>
                                                            <Typography variant="body2" color="error" gutterBottom>
                                                                Found {plagiarismResults[index].total_matches} potential match(es)
                                                            </Typography>
                                                            
                                                            {plagiarismResults[index].results.map((match, matchIndex) => (
                                                                <Box key={matchIndex} sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                                                    <Typography variant="body2" fontWeight="bold">
                                                                        Similarity: {match.similarity_percentage.toFixed(2)}%
                                                                    </Typography>
                                                                    
                                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                                        <strong>Student:</strong> {match.student_name} (Roll: {match.student_roll})
                                                                    </Typography>
                                                                    
                                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                                        <strong>Question:</strong> {match.question}
                                                                    </Typography>
                                                                    
                                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                                        <strong>Answer:</strong> {match.answer}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        <Typography variant="body2" color="success.main">
                                                            No plagiarism detected.
                                                        </Typography>
                                                    )}
                                                </Paper>
                                            )}
                                        </>
                                    )}
                                    
                                    {isGraded && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" gutterBottom>
                                                Grade: {item.marks}
                                            </Typography>
                                        </Box>
                                    )}
                                    
                                    {index < studentQuestionResults.result.length - 1 && (
                                        <Divider sx={{ my: 2 }} />
                                    )}
                                </Box>
                            ))}
                            
                            {!isGraded && hasSubmittedAnswers && (
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                    <BlueButton
                                        variant="contained"
                                        onClick={handleSubmitGrades}
                                        disabled={loader}
                                    >
                                        {loader ? <CircularProgress size={24} color="inherit" /> : "Submit Grades"}
                                    </BlueButton>
                                </Box>
                            )}
                            
                            {isGraded && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    This student's answers have already been graded.
                                </Alert>
                            )}
                        </Paper>
                    )}
                    
                    <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
                </>
            )}
        </Container>
    )
}

export default StudentQuestionsReview