import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConsultationRequest } from '../../types';

interface ConsultationRequestsState {
  requests: ConsultationRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: ConsultationRequestsState = {
  requests: [],
  loading: false,
  error: null,
};

const consultationRequestsSlice = createSlice({
  name: 'consultationRequests',
  initialState,
  reducers: {
    setRequests: (state, action: PayloadAction<ConsultationRequest[]>) => {
      state.requests = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    removeRequest: (state, action: PayloadAction<number>) => {
      state.requests = state.requests.filter(r => r.id !== action.payload);
    },
  },
});

export const { setRequests, setLoading, setError, removeRequest } = consultationRequestsSlice.actions;
export default consultationRequestsSlice.reducer;
