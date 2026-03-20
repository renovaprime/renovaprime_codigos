import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CmsProvider } from './contexts/CmsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Partners from './pages/Partners';
import Plans from './pages/Plans';
import ProfessionalSignup from './pages/ProfessionalSignup';
import LoginPlaceholder from './pages/LoginPlaceholder';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AccountDeletion from './pages/AccountDeletion';

function App() {
  return (
    <CmsProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/parceiros" element={<Partners />} />
              <Route path="/planos" element={<Plans />} />
              <Route path="/cadastro-profissional" element={<ProfessionalSignup />} />
              <Route path="/login/:type" element={<LoginPlaceholder />} />
              <Route path="/termos-de-uso" element={<TermsOfUse />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
              <Route path="/exclusao-de-conta" element={<AccountDeletion />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </CmsProvider>
  );
}

export default App;
