import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Partners from './pages/Partners';
import Plans from './pages/Plans';
import ProfessionalSignup from './pages/ProfessionalSignup';
import LoginPlaceholder from './pages/LoginPlaceholder';

function App() {
  return (
    <Router>
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
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
