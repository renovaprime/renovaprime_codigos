import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { setUser } from './store/slices/authSlice';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Doctors from './pages/Doctors';
import Beneficiaries from './pages/Beneficiaries';
import Appointments from './pages/Appointments';
import Referrals from './pages/Referrals';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import Checkout from './pages/Checkout';
import Partners from './pages/Partners';
import Branches from './pages/Branches';
import Resellers from './pages/Resellers';
import SalesReport from './pages/SalesReport';
import CommissionReport from './pages/CommissionReport';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  if (!token) {
    // Save the attempted URL
    sessionStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (token && email) {
      dispatch(setUser({ email, token }));
      
      // Clear the redirect URL after successful navigation
      sessionStorage.removeItem('redirectUrl');
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="checkout" element={<Checkout />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/profissionais" />} />
        <Route path="profissionais" element={<Doctors />} />
        <Route path="beneficiarios" element={<Beneficiaries />} />
        <Route path="agendamentos" element={<Appointments />} />
        <Route path="encaminhamentos" element={<Referrals />} />
        <Route path="site" element={<Settings />} />
        <Route path="configuracoes" element={<UserProfile />} />
        <Route path="parceiros" element={<Partners />} />
        <Route path="filiais" element={<Branches />} />
        <Route path="revendedores" element={<Resellers />} />
        <Route path="relatorio-vendas" element={<SalesReport />} />
        <Route path="relatorio-comissoes" element={<CommissionReport />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;