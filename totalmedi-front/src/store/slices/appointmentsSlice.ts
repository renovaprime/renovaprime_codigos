import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment } from '../../types';

interface AppointmentsState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  selectedAppointment: Appointment | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  loading: false,
  error: null,
  selectedAppointment: null,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedAppointment: (state, action: PayloadAction<Appointment | null>) => {
      state.selectedAppointment = action.payload;
    },
  },
});

export const { setAppointments, setLoading, setError, setSelectedAppointment } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;