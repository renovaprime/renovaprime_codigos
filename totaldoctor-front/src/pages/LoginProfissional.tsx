import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';
import logoImage from '../assets/images/logo.png';

export function LoginProfissional() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Load saved credentials if remember me was enabled
    const savedEmail = localStorage.getItem('prof_remembered_email');
    const savedPassword = localStorage.getItem('prof_remembered_password');
    const rememberMeFlag = localStorage.getItem('prof_remember_me') === 'true';

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
      
      await authService.login(email, password);

      // Save or remove credentials based on remember me preference
      if (rememberMe) {
        localStorage.setItem('prof_remembered_email', email);
        localStorage.setItem('prof_remembered_password', password);
        localStorage.setItem('prof_remember_me', 'true');
      } else {
        localStorage.removeItem('prof_remembered_email');
        localStorage.removeItem('prof_remembered_password');
        localStorage.removeItem('prof_remember_me');
      }

      // Usar window.location para forçar redirecionamento
      window.location.href = '/profissional/dashboard';
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
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary-light/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-primary/5 rounded-full blur-2xl animate-pulse-slow" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="TotalDoctor" 
              className="h-12 w-auto"
            />
          </div>

          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="font-sans text-4xl xl:text-5xl text-white leading-tight mb-6">
                Portal do{' '}
                <span className="bg-gradient-to-r from-primary-light to-white bg-clip-text text-transparent">
                  Profissional
                </span>
              </h2>
              <p className="text-lg text-white/60 leading-relaxed">
                Acesse sua área exclusiva para gerenciar suas consultas, 
                disponibilidade, receitas e histórico de atendimentos.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col"
            >
              <span className="font-display text-3xl text-white">0k+</span>
              <span className="text-sm text-white/50">Profissionais</span>
            </motion.div>
            <div className="w-px h-12 bg-white/10" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col"
            >
              <span className="font-display text-3xl text-white">0k+</span>
              <span className="text-sm text-white/50">Consultas/mes</span>
            </motion.div>
            <div className="w-px h-12 bg-white/10" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col"
            >
              <span className="font-display text-3xl text-white">24/7</span>
              <span className="text-sm text-white/50">Suporte</span>
            </motion.div>
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
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <img 
              src={logoImage} 
              alt="TotalDoctor" 
              className="h-10 w-auto"
            />
          </div>

          <div className="mb-10">
            <h1 className="font-display text-3xl text-foreground mb-3">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground">
              Acesse sua conta profissional para continuar.
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
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                placeholder="seu@email.com"
                className="pl-12"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                className="pl-12 pr-12"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  rememberMe ? 'bg-primary' : 'bg-border'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    rememberMe ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
                <span className="text-sm text-muted-foreground">Lembrar-me</span>
              </div>
              <a
                href="#"
                className="text-sm text-primary hover:text-primary-600 font-medium transition-colors"
              >
                Esqueci minha senha
              </a>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Entrar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Precisa de ajuda?{' '}
              <a
                href="#"
                className="text-primary hover:text-primary-600 font-medium transition-colors"
              >
                Entre em contato com o suporte
              </a>
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 p-4 rounded-xl bg-muted/50 border border-border/50"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Acesso seguro</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sua conexao esta protegida com criptografia de ponta a ponta.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
