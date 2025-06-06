import { useState } from "react";
import { PurpleButton } from "../../components/buttonStyles";
import { Stack, TextField, Typography, Paper, Box, Divider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createExam } from "../../redux/sclassRelated/sclassHandle";
import { useParams } from "react-router-dom";

export default function TeacherCreateExam() {
  const [questions, setQuestions] = useState([]);

  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const {
    subjectDetails: { questions: classQuestions },
  } = useSelector((state) => state.sclass);

  const subjectID = currentUser.teachSubject?._id;

  return classQuestions && classQuestions.length > 0 ? (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      {/* <Typography variant="h5" gutterBottom>
        Exam Questions:
      </Typography> */}
      {/* <Divider sx={{ mb: 2 }} /> */}
      <Stack spacing={2}>
        {classQuestions.map((ques, idx) => (
          <Box key={idx} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Question {idx + 1}:
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {ques}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  ) : (
    <Stack direction={"column"}>
      {questions.length === 0 && (
        <div>
          <PurpleButton
            variant="contained"
            onClick={() => {
              setQuestions([
                ...questions,
                { id: questions.length + 1, question: "" },
              ]);
            }}
          >
            Create Exam
          </PurpleButton>
        </div>
      )}
      {questions &&
        questions.length > 0 &&
        questions.map((ques, idx) => {
          return (
            <div style={{ width: 500 }} key={idx}>
              <Typography>Question-{idx + 1}</Typography>
              <TextField
                margin="normal"
                required
                id={`q-${idx}`}
                label={`Question-${idx + 1}`}
                name={`question-${idx}`}
                error={ques.length === 0}
                helperText={ques.length === 0 && "Question is required"}
                onChange={(e) => {
                  setQuestions((prevQuestions) =>
                    prevQuestions.map((q, qIndex) =>
                      qIndex === idx ? e.target.value : q
                    )
                  );
                }}
              />
            </div>
          );
        })}
      {questions.length !== 0 && (
        <div>
          <PurpleButton
            variant="contained"
            onClick={() => {
              setQuestions((prevQuestions) => [...prevQuestions, ""]);
            }}
          >
            Add Question
          </PurpleButton>
        </div>
      )}
      {questions.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <PurpleButton
            variant="contained"
            onClick={() => {
              dispatch(createExam(subjectID, questions));
              setQuestions([]);
            }}
          >
            Submit
          </PurpleButton>
        </div>
      )}
    </Stack>
  );
}
