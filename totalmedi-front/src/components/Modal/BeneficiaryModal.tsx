import React, { useState } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";
import * as yup from "yup";
import api from "../services/api";

interface BeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const beneficiarySchema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  cpf: yup.string().required("CPF é obrigatório"),
  birthDate: yup.string().required("Data de nascimento é obrigatória"),
  beneficiaryType: yup
    .string()
    .oneOf(["titular", "dependente"])
    .required("Tipo de beneficiário é obrigatório"),
  holder: yup.string().when("beneficiaryType", {
    is: "dependente",
    then: (schema) => schema.required("CPF do titular é obrigatório"),
    otherwise: (schema) => schema.notRequired(),
  }),
  phone: yup.string(),
  email: yup.string().email("E-mail inválido"),
  zipCode: yup.string(),
  address: yup.string(),
  city: yup.string(),
  state: yup.string(),
  paymentType: yup
    .string()
    .oneOf(["S", "A"])
    .default("S")
    .required("Tipo de pagamento é obrigatório"),
  serviceType: yup
    .string()
    .oneOf(["G", "P", "GP", "GS", "GSP"])
    .default("G")
    .required("Tipo de serviço é obrigatório"),
  general: yup.string().notRequired(),
});

const BeneficiaryModal: React.FC<BeneficiaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    beneficiaryType: "titular",
    phone: "",
    email: "",
    zipCode: "",
    address: "",
    city: "",
    state: "",
    paymentType: "S",
    serviceType: "G",
    holder: "",
    general: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await beneficiarySchema.validate(formData);
      const transformedData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ""),
        phone: formData.phone.replace(/\D/g, ""),
        zipCode: formData.zipCode.replace(/\D/g, ""),
        birthday: formData.birthDate,
        holder: formData.holder ? formData.holder.replace(/\D/g, "") : "",
        email: formData.email ? formData.email.toLowerCase() : "contato@totalmedi.com.br",
      };
      delete transformedData.birthDate;
      onSave(transformedData);
      onClose();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao enviar os dados!");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Beneficiário">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Beneficiário
          </label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="beneficiaryType"
                value="titular"
                checked={formData.beneficiaryType === "titular"}
                onChange={handleChange}
                className="form-radio text-primary"
              />
              <span className="ml-2">Titular</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="beneficiaryType"
                value="dependente"
                checked={formData.beneficiaryType === "dependente"}
                onChange={handleChange}
                className="form-radio text-primary"
              />
              <span className="ml-2">Dependente</span>
            </label>
          </div>
        </div>

        {formData.beneficiaryType === "dependente" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CPF do Titular
            </label>
            <input
              type="text"
              name="holder"
              value={formData.holder}
              onChange={handleChange}
              placeholder="00000000000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome Completo
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CPF
            </label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="00000000000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="11999999999"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="exemplo@email.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CEP
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="99999999"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cidade
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Cidade"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Selecione o estado</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Endereço
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Rua, número, complemento"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Pagamento
          </label>
          <select
            name="paymentType"
            value={formData.paymentType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option value="S">Recorrente</option>
            <option value="A">Consulta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Serviço
          </label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option value="G">Clínico</option>
            <option value="P">Psicologia</option>
            <option value="GP">Clínico + Psicologia</option>
            <option value="GS">Clínico + Especialista</option>
            <option value="GSP">Clínico + Especialistas + Psicologia</option>
          </select>
        </div>

        <button
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          type="submit"
        >
          <span>Cadastrar Beneficário</span>
        </button>
      </form>
    </Modal>
  );
};

export default BeneficiaryModal;
