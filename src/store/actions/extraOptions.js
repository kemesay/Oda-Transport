import { createAsyncThunk } from "@reduxjs/toolkit";
import { BACKEND_API } from "../utils/API";
export const getExtraOptions = createAsyncThunk(
  "extra-options/get",
  async (values, thunkAPI) => {
    try {
      var res = await BACKEND_API.get("/api/v1/extra-options");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("unable to load cars");
    }
  }
);
