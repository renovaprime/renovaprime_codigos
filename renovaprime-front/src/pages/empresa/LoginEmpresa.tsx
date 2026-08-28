import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { companyAuthService } from '../../services/companyAuthService';
import logoImage from '../../assets/images/logo.png';
import doctorBgImage from '../../assets/images/doctor-login-bg.png';

export function LoginEmpresa() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      companyAuthService.logout();
      await companyAuthService.login(email, password);
      window.location.href = '/empresa/beneficiarios';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.');
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
                Portal da{' '}
                <span className="text-primary-light">Empresa</span>
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Gerencie colaboradores, dependentes e acompanhe o plano corporativo da sua empresa.
              </p>
            </motion.div>
          </div>

          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} RenovaPrime. Todos os direitos reservados.
          </p>
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
            <img src={logoImage} alt="RenovaPrime" className="h-24 w-auto" />
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl text-foreground mb-3">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">Acesse a área da empresa com o e-mail do responsável.</p>
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
                placeholder="responsavel@empresa.com"
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
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#26A69A] hover:bg-[#1E8C82] text-white font-semibold"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Entrar
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
