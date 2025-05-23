import axios from "axios";
import {
  getRequest,
  getSuccess,
  getFailed,
  getError,
  stuffDone,
} from "./studentSlice";

export const getAllStudents = (id) => async (dispatch) => {
  dispatch(getRequest());

  try {
    const result = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/Students/${id}`
    );
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(getSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error));
  }
};

export const updateStudentFields =
  (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
      const result = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/${address}/${id}`,
        fields,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (result.data.message) {
        dispatch(getFailed(result.data.message));
      } else {
        dispatch(stuffDone());
      }
    } catch (error) {
      dispatch(getError(error));
    }
  };

export const removeStuff = (id, address) => async (dispatch) => {
  dispatch(getRequest());

  try {
    const result = await axios.put(
      `${process.env.REACT_APP_BASE_URL}/${address}/${id}`
    );
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(stuffDone());
    }
  } catch (error) {
    dispatch(getError(error));
  }
};

export const updateQuestionResult = (id, address, data) => async (dispatch) => {
  dispatch(getRequest());

  try {
    const result = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/${address}/${id}`,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    dispatch(getError(e));
  }
};

export const updateQuestionResultWithFile = (id, address, data, files) => async (dispatch) => {
  dispatch(getRequest());

  try {
    const formData = new FormData();
    formData.append('subName', data.subName);
    formData.append('questions', JSON.stringify(data.questions));

    // Append each file to the FormData
    files.forEach((file) => {
      formData.append('files', file);
    });

    const result = await axios.put(
      `${process.env.REACT_APP_BASE_URL}/${address}/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    dispatch(getSuccess(result.data));
  } catch (e) {
    dispatch(getError(e));
  }
};
