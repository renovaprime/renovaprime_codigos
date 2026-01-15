import { ResellersState } from './slices/resellersSlice';

export interface RootState {
  // ... outros estados
  resellers: ResellersState;
} 