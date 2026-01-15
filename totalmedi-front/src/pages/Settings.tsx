import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { SaveIcon, PlusIcon, EditIcon, TrashIcon, UploadIcon } from "lucide-react";
import { Depoimento } from "../types";

interface Parameter {
  id: string;
  parametro: string;
  valor: string;
}

const Settings = () => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [depoimentosLoading, setDepoimentosLoading] = useState(false);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [activeTab, setActiveTab] = useState("dados-gerais");
  
  // Estados para depoimentos
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepoimento, setEditingDepoimento] = useState<Depoimento | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch parameters when the page loads
  useEffect(() => {
    const fetchParameters = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/parametros");
        setParameters(response.data.data);
      } catch (error) {
        toast.error("Erro ao carregar parâmetros");
      } finally {
        setLoading(false);
      }
    };

    fetchParameters();
  }, []);

  // Fetch depoimentos when depoimentos tab is active
  useEffect(() => {
    if (activeTab === "depoimentos") {
      fetchDepoimentos();
    }
  }, [activeTab]);

  const fetchDepoimentos = async () => {
    setDepoimentosLoading(true);
    try {
      const response = await api.get("/api/depoimentos");
      setDepoimentos(response.data.data);
    } catch (error) {
      toast.error("Erro ao carregar depoimentos");
    } finally {
      setDepoimentosLoading(false);
    }
  };

  // Handle edit parameter
  const handleEdit = async (parameter: Parameter) => {
    try {
      const response = await api.put(`/api/parametros/${parameter.id}`, {
        valor: parameter.valor,
      });
      if (response.data.success) {
        toast.success("Parâmetro atualizado com sucesso");
      } else {
        toast.error("Erro ao atualizar parâmetro");
      }
    } catch (error) {
      toast.error("Erro ao atualizar parâmetro");
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo não permitido. Use JPEG, PNG, JPG ou WebP.");
        return;
      }
      
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Tamanho máximo: 5MB.");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  // Handle add depoimento
  const handleAddDepoimento = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo");
      return;
    }

    const formData = new FormData();
    formData.append('arquivo', selectedFile);

    try {
      const response = await api.post("/api/depoimentos", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("Depoimento adicionado com sucesso");
        setShowAddModal(false);
        setSelectedFile(null);
        fetchDepoimentos();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao adicionar depoimento");
    }
  };

  // Handle edit depoimento
  const handleEditDepoimento = async () => {
    if (!editingDepoimento) return;

    const formData = new FormData();
    if (selectedFile) {
      formData.append('arquivo', selectedFile);
    }

    try {
      const response = await api.put(`/api/depoimentos/${editingDepoimento.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("Depoimento atualizado com sucesso");
        setEditingDepoimento(null);
        setSelectedFile(null);
        fetchDepoimentos();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar depoimento");
    }
  };

  // Handle delete depoimento
  const handleDeleteDepoimento = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este depoimento?")) {
      return;
    }

    try {
      const response = await api.delete(`/api/depoimentos/${id}`);
      if (response.data.success) {
        toast.success("Depoimento excluído com sucesso");
        fetchDepoimentos();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir depoimento");
    }
  };

  // Note: Reordering functionality removed since ordem field was removed from database

  const renderDadosGerais = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parâmetro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parameters.map((parameter) => (
                <tr key={parameter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parameter.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {parameter.parametro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="text"
                      value={parameter.valor}
                      onChange={(e) => {
                        const newParameters = parameters.map((p) =>
                          p.id === parameter.id
                            ? { ...p, valor: e.target.value }
                            : p
                        );
                        setParameters(newParameters);
                      }}
                      className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEdit(parameter)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <SaveIcon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDepoimentos = () => (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Gerenciar Depoimentos</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Adicionar Depoimento
        </button>
      </div>

      {/* Lista de depoimentos */}
      {depoimentosLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {depoimentos.length === 0 ? (
            <div className="text-center py-12">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum depoimento</h3>
              <p className="mt-1 text-sm text-gray-500">Comece adicionando um novo depoimento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {depoimentos.map((depoimento, index) => (
                <div key={depoimento.id} className="bg-gray-50 rounded-lg p-4 relative group">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={`${api.defaults.baseURL}/public/${depoimento.arquivo_path}`}
                      alt={`Depoimento ${depoimento.id}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNjAgODguOTU0MyA2OC45NTQzIDgwIDgwIDgwQzkxLjA0NTcgODAgMTAwIDg4Ljk1NDMgMTAwIDEwMEMxMDAgMTExLjA0NiA5MS4wNDU3IDEyMCA4MCAxMjBDNjguOTU0MyAxMjAgNjAgMTExLjA0NiA2MCAxMDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik04MCAxNDBDNjguOTU0MyAxNDAgNjAgMTMxLjA0NiA2MCAxMjBINjBDNjAgMTMxLjA0NiA2OC45NTQzIDE0MCA4MCAxNDBaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      ID: {depoimento.id}
                    </span>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingDepoimento(depoimento);
                          setSelectedFile(null);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDepoimento(depoimento.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                  
                
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Modal para adicionar/editar depoimento
  const renderModal = () => {
    const isEditing = !!editingDepoimento;
    const modalTitle = isEditing ? "Editar Depoimento" : "Adicionar Depoimento";
    const handleSubmit = isEditing ? handleEditDepoimento : handleAddDepoimento;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{modalTitle}</h3>
            
            <div className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEditing ? "Nova Imagem (opcional)" : "Imagem"}
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingDepoimento(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90"
              >
                {isEditing ? "Atualizar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Configurações do Sistema
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("dados-gerais")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "dados-gerais"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Dados Gerais
          </button>
          <button
            onClick={() => setActiveTab("depoimentos")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "depoimentos"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Depoimentos
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "dados-gerais" && renderDadosGerais()}
        {activeTab === "depoimentos" && renderDepoimentos()}
      </div>

      {/* Modal */}
      {(showAddModal || editingDepoimento) && renderModal()}
    </div>
  );
};

export default Settings;
