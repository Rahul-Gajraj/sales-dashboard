import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUserDetail(state, action) {
      state = action.payload;

      return state;
    },
  },
});

export default userSlice.reducer;

export const { setUserDetail } = userSlice.actions;
