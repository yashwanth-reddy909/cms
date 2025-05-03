import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getClassDetails,
  getSubjectList,
} from "../../redux/sclassRelated/sclassHandle";
import {
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableHead,
  TextField,
  Typography,
  Box,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { getUserDetails } from "../../redux/userRelated/userHandle";
import CustomBarChart from "../../components/CustomBarChart";

import InsertChartIcon from "@mui/icons-material/InsertChart";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import TableChartIcon from "@mui/icons-material/TableChart";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { StyledTableCell, StyledTableRow } from "../../components/styles";
import { PurpleButton } from "../../components/buttonStyles";
import {
  updateQuestionResult,
  updateStudentFields,
  updateQuestionResultWithFile,
} from "../../redux/studentRelated/studentHandle";

const StudentSubjects = () => {
  const dispatch = useDispatch();
  const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
  const { userDetails, currentUser, loading, response, error } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    dispatch(getUserDetails(currentUser._id, "Student"));
    dispatch(getClassDetails("", "Sclass"));
  }, [dispatch, currentUser._id]);

  if (response) {
    console.log(response);
  } else if (error) {
    console.log(error);
  }

  const [subjectMarks, setSubjectMarks] = useState([]);
  const [selectedSection, setSelectedSection] = useState("table");
  const [takeTest, setTakeTest] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});

  useEffect(() => {
    if (userDetails) {
      setSubjectMarks(userDetails.examResult || []);
    }
  }, [userDetails]);

  useEffect(() => {
    if (subjectMarks.length === 0) {
      dispatch(getSubjectList(currentUser.sclassName._id, "ClassSubjects"));
    }
  }, [subjectMarks, dispatch, currentUser.sclassName._id]);

  const handleSectionChange = (event, newSection) => {
    setSelectedSection(newSection);
  };

  const handleFileChange = (subjectId, questionIndex, event) => {
    const file = event.target.files[0];
    setSelectedFiles(prev => ({
      ...prev,
      [`${subjectId}-${questionIndex}`]: file
    }));
  };

  const renderTableSection = () => {
    return (
      <>
        <Typography variant="h4" align="center" gutterBottom>
          Subject Marks
        </Typography>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>Subject</StyledTableCell>
              <StyledTableCell>Marks</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {subjectMarks.map((result, index) => {
              if (!result.subName || !result.marksObtained) {
                return null;
              }
              return (
                <StyledTableRow key={index}>
                  <StyledTableCell>{result.subName.subName}</StyledTableCell>
                  <StyledTableCell>{result.marksObtained}</StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </>
    );
  };

  const renderChartSection = () => {
    return <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />;
  };

  const RenderClassDetailsSection = () => {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {subjectsList.map((subject, index) => (
          <Paper key={index} elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">{subject.subName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Course Code: {subject.subCode}
              </Typography>
            </Box>

            {!userDetails.questionResult.find(
              (obj) => obj.subName === subject._id
            ) && (
              <Stack spacing={2}>
                {subject.questions &&
                  subject.questions.length > 0 &&
                  !takeTest.includes(subject._id) && (
                    <PurpleButton
                      variant="contained"
                      onClick={() => {
                        setTakeTest((prev) => [...prev, subject._id]);
                        setCurrentTest(subject._id);
                      }}
                    >
                      Take Test
                    </PurpleButton>
                  )}

                {currentTest === subject._id && subject.questions && (
                  <List>
                    {subject.questions.map((question, qIndex) => (
                      <ListItem key={qIndex} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <ListItemText
                          primary={`Question ${qIndex + 1}`}
                          secondary={question}
                          sx={{ mb: 1 }}
                        />
                        <Stack direction="row" spacing={2} alignItems="center">
                          <input
                            type="file"
                            accept=".txt"
                            onChange={(e) => handleFileChange(subject._id, qIndex, e)}
                            style={{ display: 'none' }}
                            id={`file-upload-${subject._id}-${qIndex}`}
                          />
                          <label htmlFor={`file-upload-${subject._id}-${qIndex}`}>
                            <PurpleButton
                              variant="contained"
                              component="span"
                              size="small"
                            >
                              Upload Answer
                            </PurpleButton>
                          </label>
                          {selectedFiles[`${subject._id}-${qIndex}`] && (
                            <Typography variant="body2" color="text.secondary">
                              {selectedFiles[`${subject._id}-${qIndex}`].name}
                            </Typography>
                          )}
                        </Stack>
                      </ListItem>
                    ))}
                    <ListItem>
                      <PurpleButton
                        variant="contained"
                        onClick={() => {
                          // Check if all questions have files
                          const allQuestionsAnswered = subject.questions.every((_, qIndex) => 
                            selectedFiles[`${subject._id}-${qIndex}`]
                          );
                          
                          if (!allQuestionsAnswered) {
                            alert('Please upload answers for all questions');
                            return;
                          }

                          // Collect all files in order
                          const files = subject.questions.map((_, qIndex) => 
                            selectedFiles[`${subject._id}-${qIndex}`]
                          );

                          dispatch(
                            updateQuestionResultWithFile(
                              userDetails._id,
                              "UpdateQuestionResultWithFile",
                              {
                                subName: subject._id,
                                questions: subject.questions
                              },
                              files
                            )
                          );
                          dispatch(getUserDetails(userDetails._id, "Student"));
                          setTakeTest((prev) => prev.filter(id => id !== subject._id));
                          setCurrentTest(null);
                          setSelectedFiles(prev => {
                            const newState = { ...prev };
                            subject.questions.forEach((_, qIndex) => {
                              delete newState[`${subject._id}-${qIndex}`];
                            });
                            return newState;
                          });
                        }}
                      >
                        Submit All Answers
                      </PurpleButton>
                    </ListItem>
                  </List>
                )}
              </Stack>
            )}
          </Paper>
        ))}
      </Container>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Your Courses
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <RenderClassDetailsSection />
      </Paper>
    </Box>
  );
};

export default StudentSubjects;
