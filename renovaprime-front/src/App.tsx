import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PartnerAuthProvider } from './contexts/PartnerAuthContext';
import { router } from './routes';

function App() {
  return (
    <AuthProvider>
      <PartnerAuthProvider>
        <RouterProvider router={router} />
      </PartnerAuthProvider>
    </AuthProvider>
  );
}

export default App;
