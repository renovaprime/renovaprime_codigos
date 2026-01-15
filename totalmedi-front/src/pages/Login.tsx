import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import * as yup from "yup";
import { setUser } from "../store/slices/authSlice";
import logo from "../logo.png";
import api from "../services/api";

const loginSchema = yup.object().shape({
  login: yup
    .string()
    .required("Login é obrigatório"),
  password: yup
    .string()
    .min(4, "A senha deve ter no mínimo 4 caracteres")
    .required("Senha é obrigatória"),
  userType: yup.string().required("Tipo de usuário é obrigatório"),
});

const Login = () => {
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [userType, setUserType] = React.useState("REVENDEDOR");
  const [loading, setLoading] = React.useState(false);
  const [wrongCredentials, setWrongCredentials] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const redirectUrl =
        sessionStorage.getItem("redirectUrl") || "/profissionais";
      navigate(redirectUrl);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setWrongCredentials(false);

    try {
      await loginSchema.validate({ login, password, userType });

      // Make API request to authenticate user
      const response = await api.post("/api/auth/login", {
        login: login,
        senha: password,
        userType,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userEmail", login);
      localStorage.setItem("userType", userType);
      localStorage.setItem("userId", response.data.user.id);
      dispatch(setUser({ email: login, token: response.data.token, userType }));

      // Navigate to saved URL or default
      let redirectUrl = "/profissionais";
      if (userType === 'REVENDEDOR') {
        redirectUrl = '/beneficiarios';
      } else if (userType === 'PARCEIRO') {
        redirectUrl = '/filiais';
      } else if (userType === 'FILIAL') {
        redirectUrl = '/revendedores';
      } else {
        redirectUrl = sessionStorage.getItem("redirectUrl") || "/profissionais";
      }
      sessionStorage.removeItem("redirectUrl");

      navigate(redirectUrl);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        setWrongCredentials(true);
      } 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f6f6] to-[#e9e9e9] flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-3xl">
        <div className="flex flex-col items-center mb-10">
          <a href="https://totalmedi.com.br" target="_blank" rel="noopener noreferrer" className="transform transition-transform duration-300 hover:scale-105">
            <img src={logo} alt="Logo" className="h-36 mb-4" />
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <label
              htmlFor="userType"
              className="block text-sm font-semibold text-[#34495e]"
            >
              Tipo de Usuário
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="mt-1 p-3 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#00c9cb] focus:ring-2 focus:ring-[#00c9cb] focus:ring-opacity-50 transition-all duration-200"
            >
              <option value="">Selecione o tipo de usuário</option>
              <option value="REVENDEDOR">Revendedor</option>
              <option value="FILIAL">Filial</option>
              <option value="PARCEIRO">Parceiro</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="login"
              className="block text-sm font-semibold text-[#34495e]"
            >
              Login
            </label>
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Digite seu login"
              className="mt-1 p-3 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#00c9cb] focus:ring-2 focus:ring-[#00c9cb] focus:ring-opacity-50 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[#34495e]"
            >
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="mt-1 p-3 block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#00c9cb] focus:ring-2 focus:ring-[#00c9cb] focus:ring-opacity-50 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 rounded-xl text-white font-semibold text-lg shadow-lg transform transition-all duration-300 hover:scale-[1.02]
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#00c9cb] hover:bg-[#00b4b6] hover:shadow-xl"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
            ) : (
              "Acessar Sistema"
            )}
          </button>
          {wrongCredentials && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
              Tipo de Usuário ou Credenciais Inválidas. Tente novamente.
            </div>
          )}
        </form>
      </div>
      
    </div>
  );
};

export default Login;
