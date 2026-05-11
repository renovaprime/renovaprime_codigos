import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { authService } from '../services/authService';
import logoImage from '../assets/images/logo.png';
import doctorBgImage from '../assets/images/doctor-login-bg.png';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    // Load saved credentials if remember me was enabled
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    const rememberMeFlag = localStorage.getItem('remember_me') === 'true';

    if (rememberMeFlag && savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Limpar qualquer sessão anterior antes de fazer novo login
      authService.logout();
      
      const { user } = await authService.login(email, password);
      const userRole = user.role?.toUpperCase();

      if (userRole !== 'ADMIN') {
        authService.logout();
        setError('Acesso negado. Esta área é exclusiva para administradores.');
        setIsLoading(false);
        return;
      }

      // Save or remove credentials based on remember me preference
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
        localStorage.setItem('remembered_password', password);
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
        localStorage.removeItem('remember_me');
      }

      window.location.href = '/dashboard';
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${doctorBgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="font-sans text-4xl xl:text-5xl text-white leading-tight mb-6">
                Gerencie suas operações médicas com{' '}
                <span className="text-primary-light">
                  eficiência
                </span>
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Plataforma administrativa completa para gerenciamento de consultas,
                médicos, parceiros e muito mais. Tudo em um único lugar.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} RenovaPrime. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-10">
            <img
              src={logoImage}
              alt="RenovaPrime"
              className="h-24 w-auto"
            />
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl text-gray-900 mb-3">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-900/60">
              Acesse sua conta para continuar gerenciando a plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-900/60 pointer-events-none" />
              <Input
                type="email"
                placeholder="seu@email.com"
                className="pl-12"
                value={email}
                data-cy="login-email-input"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-900/60 pointer-events-none" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                className="pl-12 pr-12"
                value={password}
                data-cy="login-password-input"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                data-cy="login-toggle-password"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900/60 hover:text-gray-900 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRememberMe(!rememberMe)} data-cy="login-remember-me">
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  rememberMe ? 'bg-primary' : 'bg-border'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    rememberMe ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
                <span className="text-sm text-gray-900/60">Lembrar-me</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                data-cy="login-forgot-password"
                className="text-sm text-gray-900 hover:text-gray-900 font-medium transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#26A69A] hover:bg-[#1E8C82] text-white font-semibold shadow-lg shadow-[#26A69A]/30 hover:shadow-xl hover:shadow-[#26A69A]/40 transition-all duration-300"
              isLoading={isLoading}
              disabled={isLoading}
              data-cy="login-submit-button"
            >
              Entrar
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-sm text-gray-900/60 mb-6">
              Precisa de ajuda?{' '}
              <span
                className="text-gray-900 hover:text-gray-900 font-medium transition-colors"
              >
                contato@renovaprime.com.br
              </span>
            </p>

          </div>

        </motion.div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
