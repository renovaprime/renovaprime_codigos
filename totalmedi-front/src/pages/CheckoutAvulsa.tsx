// src/pages/CheckoutAvulsa.tsx
import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import logo from "../logo.png";
import termoDeUso from "../assets/termo-de-uso.pdf";

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

interface Especialidade {
  slug: string;
  nome: string;
  preco: number;
}

const especialidades: Especialidade[] = [
  { slug: "alergia_imunologia", nome: "Alergia e Imunologia", preco: 129.00 },
  { slug: "anestesiologia", nome: "Anestesiologia", preco: 129.00 },
  { slug: "angiologia", nome: "Angiologia", preco: 129.00 },
  { slug: "ortopedia", nome: "Ortopedia", preco: 129.00 },
  { slug: "cirurgia_cardiovascular", nome: "Cirurgia Cardiovascular", preco: 129.00 },
  { slug: "cirurgia_mao", nome: "Cirurgia da Mão", preco: 229.00 },
  { slug: "cirurgia_cabeca_pescoco", nome: "Cirurgia de Cabeça e Pescoço", preco: 229.00 },
  { slug: "cirurgia_aparelho_digestivo", nome: "Cirurgia do Aparelho Digestivo", preco: 129.00 },
  { slug: "cirurgia_geral", nome: "Cirurgia Geral", preco: 55.00 },
  { slug: "cirurgia_oncologica", nome: "Cirurgia Oncológica", preco: 229.00 },
  { slug: "cirurgia_pediatrica", nome: "Cirurgia Pediátrica", preco: 229.00 },
  { slug: "cirurgia_plastica", nome: "Cirurgia Plástica", preco: 229.00 },
  { slug: "cirurgia_toracica", nome: "Cirurgia Torácica", preco: 229.00 },
  { slug: "cirurgia_vascular", nome: "Cirurgia Vascular", preco: 229.00 },
  { slug: "coloproctologia", nome: "Coloproctologia", preco: 229.00 },
  { slug: "endoscopia", nome: "Endoscopia", preco: 159.00 },
  { slug: "gastroenterologia", nome: "Gastroenterologia", preco: 159.00 },
  { slug: "hematologia_hemoterapia", nome: "Hematologia e Hemoterapia", preco: 229.00 },
  { slug: "homeopatia", nome: "Homeopatia", preco: 229.00 },
  { slug: "infectologia", nome: "Infectologia", preco: 129.00 },
  { slug: "mastologia", nome: "Mastologia", preco: 169.00 },
  { slug: "medicina_familia_comunidade", nome: "Medicina da Família e Comunidade", preco: 129.00 },
  { slug: "medicina_esportiva", nome: "Medicina Esportiva", preco: 129.00 },
  { slug: "medicina_fisica_reabilitacao", nome: "Medicina Física e Reabilitação", preco: 229.00 },
  { slug: "medicina_nuclear", nome: "Medicina Nuclear", preco: 169.00 },
  { slug: "medicina_preventiva_social", nome: "Medicina Preventiva e Social", preco: 169.00 },
  { slug: "nefrologia", nome: "Nefrologia", preco: 169.00 },
  { slug: "oftalmologia", nome: "Oftalmologia", preco: 229.00 },
  { slug: "oncologia_clinica", nome: "Oncologia Clínica", preco: 129.00 },
  { slug: "pneumologia", nome: "Pneumologia", preco: 129.00 },
  { slug: "radioterapia", nome: "Radioterapia", preco: 129.00 },
  { slug: "reumatologia", nome: "Reumatologia", preco: 129.00 },
  { slug: "neurocirurgia", nome: "Neurocirurgia", preco: 559.00 },
  { slug: "genetica_medica", nome: "Genética Médica", preco: 1590.00 },
  { slug: "neuropediatria", nome: "Neuropediatria", preco: 379.00 },
];

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

const CheckoutAvulsa: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState<Especialidade | null>(null);
  const [showEspecialidadeModal, setShowEspecialidadeModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const espParam = urlParams.get("especialidade");

    if (espParam) {
      const found = especialidades.find((e) => e.slug === espParam);
      if (found) {
        setSelectedEspecialidade(found);
      }
    }
  }, []);

  const [form, setForm] = useState({
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    if (numericFields.includes(e.target.id)) {
      const numericValue = e.target.value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [e.target.id]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    }
  };

  const preventSubmitOnEnter = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

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

    if (!selectedEspecialidade) {
      toast.error("Selecione uma especialidade");
      setLoading(false);
      return;
    }

    try {
      await schema.validate(form, { abortEarly: false });

      const formattedData = {
        especialidade: selectedEspecialidade.slug,
        especialidadeNome: selectedEspecialidade.nome,
        value: selectedEspecialidade.preco,
        name: form.name,
        cpfCnpj: form.cpfCnpj,
        email: form.email,
        phone: form.phone,
        postalCode: form.postalCode,
        address: form.address,
        addressNumber: form.addressNumber,
        addressComplement: form.addressComplement,
        province: form.province,
        city: form.city,
        state: form.state,
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
      };

      const checkoutRes = await api.post("/api/payment-avulsa", formattedData);

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
      const error = err as FormError;

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
          {/* Seleção de Especialidade */}
          <div>
            <h2 className="text-xl font-semibold text-[#34495e] mb-4 pb-2 border-b border-gray-200">
              Consulta Avulsa - Especialidade
            </h2>

            {selectedEspecialidade ? (
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1 cursor-default">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden ring-2 ring-[#00c9cb]">
                    <div className="absolute top-0 right-0 bg-[#00c9cb] text-white px-4 py-1 text-sm font-semibold">
                      CONSULTA AVULSA
                    </div>
                    <div className="p-6 pt-8 flex flex-col">
                      <h3 className="text-xl font-bold text-[#34495e] mb-4">
                        {selectedEspecialidade.nome}
                      </h3>
                      <div className="h-px bg-gray-200 mb-4"></div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center text-gray-600">
                          <span className="text-[#00c9cb] mr-2">●</span>
                          Consulta por telemedicina
                        </li>
                        <li className="flex items-center text-gray-600">
                          <span className="text-[#00c9cb] mr-2">●</span>
                          Especialidade: {selectedEspecialidade.nome}
                        </li>
                      </ul>
                      <div className="text-center mt-auto">
                        <p className="text-2xl font-bold text-[#34495e]">
                          R$ {selectedEspecialidade.preco.toFixed(2).replace(".", ",")}
                          <span className="text-sm font-normal text-gray-500"> /consulta</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEspecialidadeModal(true)}
                    className="bg-[#6a83bd] hover:bg-[#5a73ad] text-white px-5 py-3 rounded-lg font-medium transition-colors"
                  >
                    Alterar especialidade
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma especialidade selecionada</p>
                <button
                  type="button"
                  onClick={() => setShowEspecialidadeModal(true)}
                  className="bg-[#00c9cb] hover:bg-[#00b4b6] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Selecionar especialidade
                </button>
              </div>
            )}
          </div>

          {/* Dados Pessoais */}
          <div>
            <h2 className="text-xl font-semibold text-[#34495e] mb-4 pb-2 border-b border-gray-200">
              Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="cpfCnpj" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="email" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="phone" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="mobilePhone" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="postalCode" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="address" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="addressNumber" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="addressComplement" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="province" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="city" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="state" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="creditCardNumber" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="creditCardExpiryMonth" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="creditCardExpiryYear" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="creditCardHolderName" className="block text-sm font-medium text-[#34495e]">
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
                <label htmlFor="creditCardCcv" className="block text-sm font-medium text-[#34495e]">
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
              disabled={loading || !selectedEspecialidade}
              className={`w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center
                ${
                  loading || !selectedEspecialidade
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#00c9cb] hover:bg-[#00b4b6] transition-colors"
                }`}
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Processando pagamento...</span>
                </>
              ) : selectedEspecialidade ? (
                `Pagar R$ ${selectedEspecialidade.preco.toFixed(2).replace(".", ",")} (Consulta Avulsa: ${selectedEspecialidade.nome})`
              ) : (
                "Selecione uma especialidade"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de seleção de especialidade */}
      {showEspecialidadeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEspecialidadeModal(false);
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-[#00c9cb] border-b-2">
              <h3 className="text-lg font-semibold text-[#6a83bd]">
                Selecionar Especialidade
              </h3>
              <button
                type="button"
                onClick={() => setShowEspecialidadeModal(false)}
                className="text-gray-400 hover:text-[#00c9cb] text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <div className="space-y-2">
                {especialidades.map((esp) => (
                  <div
                    key={esp.slug}
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                      selectedEspecialidade?.slug === esp.slug
                        ? "bg-[#00c9cb] bg-opacity-10 ring-2 ring-[#00c9cb]"
                        : "hover:bg-gray-50 border border-gray-100"
                    }`}
                    onClick={() => {
                      setSelectedEspecialidade(esp);
                      setShowEspecialidadeModal(false);
                    }}
                  >
                    <span className="font-medium text-[#34495e]">{esp.nome}</span>
                    <span className="font-bold text-[#34495e] whitespace-nowrap ml-4">
                      R$ {esp.preco.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutAvulsa;
