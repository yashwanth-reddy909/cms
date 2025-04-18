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
    const [takeTest, setTakeTest] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [currentTest, setCurrentTest] = useState(null);

    return (
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          Class Details
        </Typography>
        <Typography variant="h5" gutterBottom>
          You are currently in Class {userDetails?.sclassName?.sclassName}
        </Typography>
        <Typography variant="h6" gutterBottom>
          And these are the subjects:
        </Typography>
        {subjectsList &&
          subjectsList.map((subject, index) => (
            <Stack
              key={index}
              direction={currentTest === subject._id ? "column" : "row"}
              spacing={2}
            >
              <Typography variant="subtitle1">
                {subject.subName} ({subject.subCode})
              </Typography>
              {!userDetails.questionResult.find(
                (obj) => obj.subName === subject._id
              ) && (
                <Stack
                  direction={currentTest === subject._id ? "column" : "row"}
                >
                  {subject.questions &&
                    subject.questions.length > 0 &&
                    !takeTest.includes(subject._id) && (
                      <div>
                        <PurpleButton
                          variant="contained"
                          onClick={() => {
                            setTakeTest((prev) => [...prev, subject._id]);
                            setCurrentTest(subject._id);
                            setAnswers(
                              Array.from({
                                length: subject.questions.length,
                              }).fill("")
                            );
                          }}
                        >
                          Take Test
                        </PurpleButton>
                      </div>
                    )}
                  <div style={{ width: 500 }}>
                    {currentTest === subject._id &&
                      subject.questions &&
                      subject.questions.length > 0 &&
                      subject.questions.map((ques, idx) => {
                        return (
                          <Stack key={idx} direction={"column"}>
                            <Typography variant="h6" gutterBottom>
                              {ques}
                            </Typography>
                            <TextField
                              margin="normal"
                              required
                              id={`a-${idx}`}
                              label={`Answer-${idx + 1}`}
                              name={`answer-${idx}`}
                              error={answers[idx].length === 0}
                              helperText={
                                answers[idx].length === 0 &&
                                "Answer is required"
                              }
                              onChange={(e) => {
                                setAnswers((prevAnswers) =>
                                  prevAnswers.map((a, aIndex) =>
                                    aIndex === idx ? e.target.value : a
                                  )
                                );
                              }}
                            />
                          </Stack>
                        );
                      })}
                    {currentTest === subject._id &&
                      subject.questions &&
                      subject.questions.length > 0 && (
                        <div>
                          <PurpleButton
                            variant="contained"
                            onClick={() => {
                              const result = subject.questions.map(
                                (ques, idx) => ({
                                  question: ques,
                                  answer: answers[idx],
                                })
                              );
                              dispatch(
                                updateStudentFields(
                                  userDetails._id,
                                  {
                                    subName: subject._id,
                                    result,
                                  },
                                  "UpdateQuestionResult"
                                )
                              );
                              dispatch(
                                getUserDetails(userDetails._id, "Student")
                              );
                            }}
                          >
                            Submit
                          </PurpleButton>
                        </div>
                      )}
                  </div>
                </Stack>
              )}
            </Stack>
          ))}
      </Container>
    );
  };

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {subjectMarks &&
          Array.isArray(subjectMarks) &&
          subjectMarks.length > 0 ? (
            <>
              {selectedSection === "table" && renderTableSection()}
              {selectedSection === "chart" && renderChartSection()}

              <Paper
                sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
                elevation={3}
              >
                <BottomNavigation
                  value={selectedSection}
                  onChange={handleSectionChange}
                  showLabels
                >
                  <BottomNavigationAction
                    label="Table"
                    value="table"
                    icon={
                      selectedSection === "table" ? (
                        <TableChartIcon />
                      ) : (
                        <TableChartOutlinedIcon />
                      )
                    }
                  />
                  <BottomNavigationAction
                    label="Chart"
                    value="chart"
                    icon={
                      selectedSection === "chart" ? (
                        <InsertChartIcon />
                      ) : (
                        <InsertChartOutlinedIcon />
                      )
                    }
                  />
                </BottomNavigation>
              </Paper>
            </>
          ) : (
            <RenderClassDetailsSection />
          )}
        </div>
      )}
    </>
  );
};

export default StudentSubjects;
