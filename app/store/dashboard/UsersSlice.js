import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "users",
  initialState: [],
  reducers: {
    setUsers(state, action) {
      state = action.payload;

      return state;
    },
  },
});

export default usersSlice.reducer;

export const { setUsers } = usersSlice.actions;
