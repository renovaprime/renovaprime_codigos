import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";
import * as yup from "yup";
import api from "../../services/api";

interface BeneficiaryFormData {
  uuid: string;
  name: string;
  birthday: string;
  phone: string;
  email: string;
  zipCode: string;
  address: string;
  city: string;
  state: string;
  paymentType: "S" | "A";
  serviceType: "G" | "P" | "GP" | "GS" | "GSP";
}

interface EditBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: BeneficiaryFormData;
  onUpdate: (data: BeneficiaryFormData) => void;
}

const beneficiarySchema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  birthday: yup.string().required("Data de nascimento é obrigatória"),
  phone: yup.string(),
  email: yup.string().email("Email inválido"),
  zipCode: yup.string(),
  address: yup.string(),
  city: yup.string(),
  state: yup.string().length(2),
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
});

const EditBeneficiaryModal: React.FC<EditBeneficiaryModalProps> = ({
  isOpen,
  onClose,
  beneficiary,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<BeneficiaryFormData | undefined>();

  useEffect(() => {
    if (beneficiary) {
      setFormData({
        ...beneficiary,
        phone: beneficiary.phone.replace(/\D/g, ""),
        birthday: beneficiary.birthday.split("/").reverse().join("-"),
      });
    }
  }, [beneficiary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await beneficiarySchema.validate(formData);
      const response = await api.put(
        `/api/beneficiaries/${beneficiary.uuid}`,
        formData
      );

      // Fetch updated list of beneficiaries
      const updatedListResponse = await api.get("/api/beneficiaries");
      onUpdate(updatedListResponse.data.beneficiaries);

      toast.success("Beneficiário atualizado com sucesso!");
      onClose();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao atualizar os dados!");
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
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Beneficiário">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome Completo
          </label>
          <input
            type="text"
            name="name"
            value={formData?.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data de Nascimento
          </label>
          <input
            type="date"
            name="birthday"
            value={formData?.birthday}
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
            value={formData?.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData?.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Endereço
          </label>
          <input
            type="text"
            name="address"
            value={formData?.address}
            onChange={handleChange}
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
              value={formData?.zipCode}
              onChange={handleChange}
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
              value={formData?.city}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="state"
              value={formData?.state}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Selecione um estado</option>
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
            Tipo de Pagamento
          </label>
          <select
            name="paymentType"
            value={formData?.paymentType}
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
            value={formData?.serviceType}
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
          <span>Salvar Alterações</span>
        </button>
      </form>
    </Modal>
  );
};

export default EditBeneficiaryModal;
