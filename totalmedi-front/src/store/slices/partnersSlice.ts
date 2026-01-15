import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Partner {
  id: number;
  nome: string;
  cnpj: string;
  agencia: string;
  conta: string;
  digito: string;
  pix: string;
  email: string;
  ativo: boolean;
  data_registro: string;
  logotipo?: string;
  url?: string;
}

interface PartnersState {
  partners: Partner[];
  loading: boolean;
  error: string | null;
}

const initialState: PartnersState = {
  partners: [],
  loading: false,
  error: null,
};

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    setPartners: (state, action: PayloadAction<Partner[]>) => {
      state.partners = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPartners, setLoading, setError } = partnersSlice.actions;
export default partnersSlice.reducer; 