import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Branch {
  id: number;
  id_parceiro: number;
  titulo: string;
  apelido: string;
  endereco: string;
  email: string;
  ativo: boolean;
  data_registro: string;
  parceiro: {
    nome: string;
  };
}

interface BranchesState {
  branches: Branch[];
  loading: boolean;
  error: string | null;
}

const initialState: BranchesState = {
  branches: [],
  loading: false,
  error: null,
};

const branchesSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    setBranches: (state, action: PayloadAction<Branch[]>) => {
      state.branches = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setBranches, setLoading, setError } = branchesSlice.actions;
export default branchesSlice.reducer; 