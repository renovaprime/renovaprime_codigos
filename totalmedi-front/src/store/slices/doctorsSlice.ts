import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Doctor } from '../../types';

interface DoctorsState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  selectedDoctor: Doctor | null;
}

const initialState: DoctorsState = {
  doctors: [],
  loading: false,
  error: null,
  selectedDoctor: null,
};

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setDoctors: (state, action: PayloadAction<Doctor[]>) => {
      state.doctors = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedDoctor: (state, action: PayloadAction<Doctor | null>) => {
      state.selectedDoctor = action.payload;
    },
  },
});

export const { setDoctors, setLoading, setError, setSelectedDoctor } = doctorsSlice.actions;
export default doctorsSlice.reducer;