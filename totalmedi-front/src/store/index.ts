import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import doctorsReducer from './slices/doctorsSlice';
import beneficiariesReducer from './slices/beneficiariesSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import partnersReducer from './slices/partnersSlice';
import branchesReducer from './slices/branchesSlice';
import resellersReducer from './slices/resellersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    beneficiaries: beneficiariesReducer,
    appointments: appointmentsReducer,
    partners: partnersReducer,
    branches: branchesReducer,
    resellers: resellersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;