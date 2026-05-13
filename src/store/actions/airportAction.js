import { createAsyncThunk } from "@reduxjs/toolkit";
import { BACKEND_API } from "../utils/API";
export const getAirports = createAsyncThunk(
  "book/get-cars",
  async (values, thunkAPI) => {
    try {
      var res = await BACKEND_API.get("/api/v1/airports");
      console.log("airports: ", res.data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("unable to load cars");
    }
  }
);
