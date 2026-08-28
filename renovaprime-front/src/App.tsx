import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PartnerAuthProvider } from './contexts/PartnerAuthContext';
import { CompanyAuthProvider } from './contexts/CompanyAuthContext';
import { router } from './routes';

function App() {
  return (
    <AuthProvider>
      <PartnerAuthProvider>
        <CompanyAuthProvider>
          <RouterProvider router={router} />
        </CompanyAuthProvider>
      </PartnerAuthProvider>
    </AuthProvider>
  );
}

export default App;
