import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { SaveIcon } from "lucide-react";

const UserProfile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch user details on component load
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/auth/verify");
        setUser({
          name: response.data.user.nome,
          email: response.data.user.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        toast.error("Erro ao carregar dados do usuário");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.put("/api/update-profile", {
        name: user.name,
        email: user.email,
      });
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (user.newPassword !== user.confirmPassword) {
      return toast.error("As senhas novas não coincidem.");
    }
    setLoading(true);
    try {
      await api.post("/api/auth/change-password", {
        currentPassword: user.currentPassword,
        newPassword: user.newPassword,
      });
      toast.success("Senha alterada com sucesso");
    } catch (error) {
      toast.error("Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">Meu Perfil</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4">
            <div className="space-y-4">
              {/* Name and Email Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  disabled
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  disabled
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>

              {/* Password Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Senha Atual
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={user.currentPassword}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={user.newPassword}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={user.confirmPassword}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Alterar Senha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
