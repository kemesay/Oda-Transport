import { createAsyncThunk } from "@reduxjs/toolkit";
import { BACKEND_API } from "../utils/API";

export const getAllCars = createAsyncThunk(
  "car/get-cars",
  async (values, thunkAPI) => {
    try {
      var res = await BACKEND_API.get("/api/v1/cars");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("unable to load cars");
    }
  }
);
