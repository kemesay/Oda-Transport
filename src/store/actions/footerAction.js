import { createAsyncThunk } from "@reduxjs/toolkit";
import { BACKEND_API } from "../utils/API";
export const getFooterData = createAsyncThunk(
  "gooter/get-footer-data",
  async (values, thunkAPI) => {
    try {
      var res = await BACKEND_API.get("/api/v1/footer-contents");
       return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("unable to load footer data");
    }
  }
);
