import { createAsyncThunk } from "@reduxjs/toolkit";
import { BACKEND_API } from "../utils/API";
export const getAllPreferences = createAsyncThunk(
  "preference/fetch-all",
  async (value, thunkAPI) => {
    try {
      var res = await BACKEND_API.get("/api/v1/airport/pickup-preference");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("unable to load cars");
    }
  }
);
