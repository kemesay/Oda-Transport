import { createAsyncThunk } from "@reduxjs/toolkit";
import { BACKEND_API } from "../utils/API";

export const signIn = createAsyncThunk(
  "user/login",
  async (values, thunkAPI) => {
    const body = {
      username: values.username,
      password: values.password,
    };

    try {
      var res;
      await BACKEND_API
        .post("/api/v1/auth/login", body)
        .then((response) => {
          res = response.data;
        });
      return res;
    } catch (error) {
      const errorText = error?.response
        ? error?.response.data.message
        : "Network Error";
      return thunkAPI.rejectWithValue(errorText);
    }
  }
);

export const signup = createAsyncThunk(
  "user/signup",
  async (values, thunkAPI) => {
    const body = {
      fullName: values.firstname + " " + values.lastname,
      email: values.email,
      phoneNumber: values.phone,
      password: values.password,
    };

    try {
      var res;
      await BACKEND_API.post("/api/v1/users", body).then((response) => {
        res = response.data;
      });
      return res;
    } catch (error) {
      const errorText = error?.response
        ? error?.response.data.message
        : "Network Error";
      return thunkAPI.rejectWithValue(errorText);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/reset",
  async (values, thunkAPI) => {
    try {
      var res;
      await BACKEND_API
        .post("/api/v1/auth/reset-password", values)
        .then((response) => {
          res = response.data;
        });
      return res;
    } catch (error) {
      const errorText = error?.response
        ? error?.response.data.message
        : "Network Error";
      return thunkAPI.rejectWithValue(errorText);
    }
  }
);

export const forgetPassword = createAsyncThunk(
  "user/forget",
  async (values, thunkAPI) => {
    console.log("values: ", values);
    try {
      var res;
      await BACKEND_API
        .post("/api/v1/auth/forgot-password", values)
        .then((response) => {
          res = response.data;
        });
      return res;
    } catch (error) {
      const errorText = error?.response
        ? error?.response.data.message
        : "Network Error";
      return thunkAPI.rejectWithValue(errorText);
    }
  }
);
