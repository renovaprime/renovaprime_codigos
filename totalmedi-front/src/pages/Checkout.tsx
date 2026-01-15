// src/pages/Checkout.tsx
import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import logo from "../logo.png";
import termoDeUso from "../assets/termo-de-uso.pdf";

// 1. Validação do formulário
const schema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  cpfCnpj: yup.string().required("CPF/CNPJ é obrigatório"),
  email: yup.string()
    .required("Email é obrigatório")
    .email("Email deve ser válido"),
  phone: yup.string()
    .required("Telefone é obrigatório")
    .length(11, "Telefone deve ter 11 dígitos"),
  postalCode: yup.string().required("CEP é obrigatório"),
  address: yup.string().required("Logradouro é obrigatório"),
  addressNumber: yup.string().required("Número é obrigatório"),
  addressComplement: yup.string(),
  province: yup.string().required("Bairro é obrigatório"),
  city: yup.string().required("Cidade é obrigatória"),
  state: yup.string().length(2).required(),
  creditCardHolderName: yup.string().required(),
  creditCardNumber: yup.string().required(),
  creditCardExpiryMonth: yup.string().required(),
  creditCardExpiryYear: yup.string().required(),
  creditCardCcv: yup.string().required(),
});

// Adicione esses tipos antes da definição do componente
interface YupValidationError {
  inner: Array<{
    message: string;
    path: string;
  }>;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

type FormError = YupValidationError | ApiError;

interface Dependent {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
}

const Spinner: React.FC = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// Modal para adicionar dependente
const DependentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (dependent: Omit<Dependent, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [dependentForm, setDependentForm] = useState({
    name: "",
    cpf: "",
    birthDate: "",
  });

  const handleSave = () => {
    if (!dependentForm.name || !dependentForm.cpf || !dependentForm.birthDate) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    onSave(dependentForm);
    setDependentForm({ name: "", cpf: "", birthDate: "" });
    onClose();
  };

  const handleDependentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      const numericValue = value.replace(/\D/g, "");
      setDependentForm(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setDependentForm(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Adicionar Dependente</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <input
              type="text"
              name="name"
              value={dependentForm.name}
              onChange={handleDependentChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              CPF (somente números)
            </label>
            <input
              type="text"
              name="cpf"
              value={dependentForm.cpf}
              onChange={handleDependentChange}
              maxLength={11}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="birthDate"
              value={dependentForm.birthDate}
              onChange={handleDependentChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[#00c9cb] hover:bg-[#00b4b6] rounded-md"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

const Checkout: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rev, setRev] = useState<string | null>(null);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isDependentModalOpen, setIsDependentModalOpen] = useState(false);

  const plans = [
    { id: 'plano_individual', name: 'Consulta Clínico Geral', description: ['Clínico Geral'], price: 39.90 },
    { id: 'plano_individual_site', name: 'Individual', description: ['Clínico Geral'], price: 39.90 },
    { id: 'plano_individual_premium', name: 'Individual Premium', description: ['Clínico Geral', 'Especialidades Médicas', 'Psicologo', 'Nutrição'], price: 59.90 },
    { id: 'plano_familiar', name: 'Familiar Master', description: ['Clínico Geral', 'Especialidades Médicas', 'Psicologo', 'Nutrição', '3 integrantes da família'], price: 84.90 },
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const revParam = urlParams.get('rev');
    const planParam = urlParams.get('p');

    let plan = '';

    if(planParam == '1' && !revParam){
      plan = 'plano_individual_site';
    }

    if(planParam == '1' && revParam){
      plan = 'plano_individual';
    }

    if(planParam == '2'){
      plan = 'plano_individual_premium';
    }

    if(planParam == '3'){
      plan = 'plano_familiar';
    }

    setRev(revParam);
    setForm(prev => ({ ...prev, selectedPlan: plan || (revParam ? 'plano_individual' : 'plano_individual_site') }));
  }, []);

  const [form, setForm] = useState({
    selectedPlan: "",
    name: "",
    cpfCnpj: "",
    email: "",
    phone: "",
    postalCode: "",
    address: "",
    addressNumber: "",
    addressComplement: "",
    province: "",
    city: "",
    state: "",
    creditCardHolderName: "",
    creditCardNumber: "",
    creditCardExpiryMonth: "",
    creditCardExpiryYear: "",
    creditCardCcv: "",
    mobilePhone: "",
  });

  // Funções para gerenciar dependentes
  const addDependent = (dependentData: Omit<Dependent, 'id'>) => {
    if (dependents.length >= 3) {
      toast.error("Máximo de 3 dependentes permitidos");
      return;
    }

    const newDependent: Dependent = {
      ...dependentData,
      id: Date.now().toString(),
    };

    setDependents(prev => [...prev, newDependent]);
    toast.success("Dependente adicionado com sucesso!");
  };

  const removeDependent = (id: string) => {
    setDependents(prev => prev.filter(dep => dep.id !== id));
    toast.success("Dependente removido com sucesso!");
  };

  // Limpar dependentes quando mudar de plano familiar para outro
  useEffect(() => {
    if (form.selectedPlan !== 'plano_familiar') {
      setDependents([]);
    }
  }, [form.selectedPlan]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // Lista de campos que devem aceitar apenas números
    const numericFields = [
      "cpfCnpj",
      "phone",
      "mobilePhone",
      "postalCode",
      "creditCardNumber",
      "creditCardExpiryMonth",
      "creditCardExpiryYear",
      "creditCardCcv",
    ];

    // Se o campo estiver na lista, filtra apenas números
    if (numericFields.includes(e.target.id)) {
      const numericValue = e.target.value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [e.target.id]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    }
  };

  // Adicione esta função para prevenir submissão ao pressionar Enter
  const preventSubmitOnEnter = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Adicione esta constante com as UFs do Brasil
  const estados = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validação específica para plano familiar
      if (form.selectedPlan === 'plano_familiar') {
        if (dependents.length === 0) {
          toast.error("Plano familiar requer pelo menos 1 dependente");
          setLoading(false);
          return;
        }
        if (dependents.length > 3) {
          toast.error("Máximo de 3 dependentes permitidos");
          setLoading(false);
          return;
        }
      }

      // 2. valida form
      await schema.validate(form, { abortEarly: false });

      // Estrutura os dados conforme o formato esperado
      const formattedData = {
        selectedPlan: form.selectedPlan,
        city: form.city,
        state: form.state,
        name: form.name,
        cpfCnpj: form.cpfCnpj,
        email: form.email,
        phone: form.phone,
        postalCode: form.postalCode,
        address: form.address,
        addressNumber: form.addressNumber,
        addressComplement: form.addressComplement,
        province: form.province,
        creditCard: {
          holderName: form.creditCardHolderName,
          number: form.creditCardNumber,
          expiryMonth: form.creditCardExpiryMonth,
          expiryYear: form.creditCardExpiryYear,
          ccv: form.creditCardCcv,
        },
        creditCardHolderInfo: {
          name: form.name,
          email: form.email,
          cpfCnpj: form.cpfCnpj,
          postalCode: form.postalCode,
          addressNumber: form.addressNumber,
          addressComplement: form.addressComplement,
          phone: form.phone,
          mobilePhone: form.mobilePhone || form.phone,
        },
        // Adicionar dependentes se for plano familiar
        dependents: form.selectedPlan === 'plano_familiar' ? dependents : undefined,
      };

      const serviceUrl = (form.selectedPlan === 'plano_individual') ? "/api/payment" : "/api/subscription";

      const checkoutRes = await api.post(serviceUrl, {
        ...formattedData,
        rev: rev,
      });

      if (checkoutRes.data.success) {
        toast.success(
          "Pagamento efetuado com sucesso! Você será redirecionado para o sistema."
        );
        setTimeout(() => {
          window.location.href = "https://cliente.totalmedi.com.br";
        }, 2500);
      } else {
        toast.error(checkoutRes.data.error);
      }
    } catch (err: unknown) {
      // Tipagem correta para erros
      const error = err as FormError;

      // erros de validação yup
      if ("inner" in error) {
        error.inner.forEach((e) => toast.error(e.message));
      } else if ("response" in error) {
        toast.error(error.response?.data?.error || "Erro inesperado");
      } else {
        toast.error("Erro inesperado");
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center px-4 py-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl">
        <div className="flex flex-col items-center mb-6">
          <a href="https://totalmedi.com.br" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="Logo TotalMedi" className="h-24 mb-4" />
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seleção de Plano */}
          <div>
            <h2 className="text-xl font-semibold text-[#34495e] mb-4 pb-2 border-b border-gray-200">
              Selecione abaixo a opção desejada para finalizar a compra:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.filter(plan =>(( !rev && plan.id !== 'plano_individual')||(rev && plan.id !== 'plano_individual_site'))).map((plan, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    form.selectedPlan === plan.id
                      ? 'ring-2 ring-[#00c9cb] scale-105'
                      : 'hover:scale-105'
                  }`}
                  onClick={() => setForm(prev => ({ ...prev, selectedPlan: plan.id }))}
                >
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 right-0 bg-[#00c9cb] text-white px-4 py-1 text-sm font-semibold">
                      {plan.id === 'plano_familiar' ? 'FAMILIAR' : 'INDIVIDUAL'}
                    </div>
                    <div className="p-6 pt-8 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-[#34495e] mb-4">
                        {plan.name}
                      </h3>
                      <div className="h-px bg-gray-200 mb-4"></div>
                      <ul className="space-y-2 mb-6 flex-grow">
                        {plan.description.map((item, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <span className="text-[#00c9cb] mr-2">●</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="text-center mt-auto">
                        <p className="text-2xl font-bold text-[#34495e]">
                          R${plan.price.toFixed(2)}
                          <span className="text-sm font-normal text-gray-500">{index !== 0 || !rev ? '/mensal' : ''}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seleção de Dependentes - só aparece para plano familiar */}
          {form.selectedPlan === 'plano_familiar' && (
            <div>
              <h2 className="text-xl font-semibold text-[#34495e] mb-4 pb-2 border-b border-gray-200">
                Dependentes ({dependents.length}/3)
              </h2>
              
              {dependents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum dependente adicionado</p>
                  <p className="text-sm">O plano familiar requer pelo menos 1 dependente</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {dependents.map((dependent) => (
                    <div key={dependent.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{dependent.name}</h4>
                          <p className="text-sm text-gray-600">CPF: {dependent.cpf}</p>
                          <p className="text-sm text-gray-600">
                            Data de Nascimento: {new Date(dependent.birthDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDependent(dependent.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {dependents.length < 3 && (
                <button
                  type="button"
                  onClick={() => setIsDependentModalOpen(true)}
                  className="bg-[#00c9cb] hover:bg-[#00b4b6] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Adicionar Dependente</span>
                </button>
              )}
            </div>
          )}

          {/* Dados Pessoais */}
          <div>
            <h2 className="text-xl font-semibold text-[#34495e] mb-4 pb-2 border-b border-gray-200">
              Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Nome completo
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="cpfCnpj"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  CPF/CNPJ (somente números)
                </label>
                <input
                  id="cpfCnpj"
                  type="text"
                  value={form.cpfCnpj}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  maxLength={14}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Email
                </label>
                <input
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Telefone
                </label>
                <input
                  id="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  maxLength={11}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="mobilePhone"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Celular
                </label>
                <input
                  id="mobilePhone"
                  value={form.mobilePhone}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
            </div>
          </div>

          {/* Dados de Endereço */}
          <div>
            <h2 className="text-xl font-semibold text-[#34495e] mb-4 pb-2 border-b border-gray-200">
              Endereço
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  CEP
                </label>
                <input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div className="md:col-span-3">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Logradouro
                </label>
                <input
                  id="address"
                  value={form.address}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="addressNumber"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Número
                </label>
                <input
                  id="addressNumber"
                  value={form.addressNumber}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="addressComplement"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Complemento
                </label>
                <input
                  id="addressComplement"
                  value={form.addressComplement}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="province"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Bairro
                </label>
                <input
                  id="province"
                  value={form.province}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Cidade
                </label>
                <input
                  id="city"
                  value={form.city}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  UF
                </label>
                <select
                  id="state"
                  value={form.state}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                >
                  <option value="">Selecione</option>
                  {estados.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.sigla} - {estado.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dados do Cartão */}
          <div>
            <h2 className="text-xl font-semibold text-[#34495e] mb-4 pb-2 border-b border-gray-200">
              Dados do Cartão
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="creditCardNumber"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Número do cartão
                </label>
                <input
                  id="creditCardNumber"
                  type="text"
                  value={form.creditCardNumber}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  maxLength={16}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="creditCardExpiryMonth"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Mês (MM)
                </label>
                <input
                  id="creditCardExpiryMonth"
                  type="text"
                  value={form.creditCardExpiryMonth}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  maxLength={2}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="creditCardExpiryYear"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Ano (AAAA)
                </label>
                <input
                  id="creditCardExpiryYear"
                  type="text"
                  value={form.creditCardExpiryYear}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  maxLength={4}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div className="md:col-span-3">
                <label
                  htmlFor="creditCardHolderName"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  Nome impresso no cartão
                </label>
                <input
                  id="creditCardHolderName"
                  value={form.creditCardHolderName}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
              <div>
                <label
                  htmlFor="creditCardCcv"
                  className="block text-sm font-medium text-[#34495e]"
                >
                  CVV
                </label>
                <input
                  id="creditCardCcv"
                  type="text"
                  value={form.creditCardCcv}
                  onChange={handleChange}
                  onKeyDown={preventSubmitOnEnter}
                  maxLength={4}
                  className="pl-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00c9cb] focus:ring-[#00c9cb]"
                />
              </div>
            </div>
          </div>

          {/* Termo de Uso */}
          <div>
            <h2 className="text-xl font-semibold text-[#34495e] mb-4 pb-2 border-b border-gray-200">
              Termo de Uso e Consentimento
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-gray-700 mb-3">
                Antes de finalizar sua compra, você deve ler e aceitar nosso Termo de Uso e Consentimento para Serviços de Teleconsulta.
              </p>
              <a
                href={termoDeUso}
                download="termo-de-uso-totalmedi.pdf"
                className="inline-flex items-center space-x-2 text-[#00c9cb] hover:text-[#00b4b6] font-medium transition-colors border-2 border-blue-200 rounded-md p-2"
              >
                <span>Baixar Termo de Uso (PDF)</span>
              </a>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#00c9cb] hover:bg-[#00b4b6] transition-colors"
                }`}
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Processando pagamento...</span>
                </>
              ) : (
                `Pagar R$ ${plans.find(p => p.id === form.selectedPlan)?.price.toFixed(2)} (${(!rev || (rev && form.selectedPlan != 'plano_individual'))? 'Plano mensal: ' : ''}${plans.find(p => p.id === form.selectedPlan)?.name})`
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal para adicionar dependente */}
      <DependentModal
        isOpen={isDependentModalOpen}
        onClose={() => setIsDependentModalOpen(false)}
        onSave={addDependent}
      />
    </div>
  );
};

export default Checkout;
