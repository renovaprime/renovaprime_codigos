import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Reseller {
  id: number;
  id_filial: number;
  nome: string;
  cpf: string;
  cargo: string;
  email: string;
  telefone: string;
  pix: string;
  unidade_funcional: string;
  matricula: string;
  ativo: boolean;
  data_registro: string;
  filial_titulo: string;
  parceiro_nome: string;
}

interface ResellersState {
  resellers: Reseller[];
  loading: boolean;
  error: string | null;
}

const initialState: ResellersState = {
  resellers: [],
  loading: false,
  error: null,
};

const resellersSlice = createSlice({
  name: 'resellers',
  initialState,
  reducers: {
    setResellers: (state, action: PayloadAction<Reseller[]>) => {
      state.resellers = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setResellers, setLoading, setError } = resellersSlice.actions;
export default resellersSlice.reducer; 