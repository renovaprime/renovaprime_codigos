import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Beneficiary } from '../../types';

interface BeneficiariesState {
  beneficiaries: Beneficiary[];
  loading: boolean;
  error: string | null;
  selectedBeneficiary: Beneficiary | null;
}

const initialState: BeneficiariesState = {
  beneficiaries: [],
  loading: false,
  error: null,
  selectedBeneficiary: null,
};

const beneficiariesSlice = createSlice({
  name: 'beneficiaries',
  initialState,
  reducers: {
    setBeneficiaries: (state, action: PayloadAction<Beneficiary[]>) => {
      state.beneficiaries = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedBeneficiary: (state, action: PayloadAction<Beneficiary | null>) => {
      state.selectedBeneficiary = action.payload;
    },
  },
});

export const { setBeneficiaries, setLoading, setError, setSelectedBeneficiary } = beneficiariesSlice.actions;
export default beneficiariesSlice.reducer;