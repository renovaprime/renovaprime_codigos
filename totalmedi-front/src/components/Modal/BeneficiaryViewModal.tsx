import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import api from "../../services/api";
import { toast } from "react-toastify";

interface Beneficiary {
  uuid: string;
  name: string;
  cpf: string;
  birthday: string;
  phone: string;
  email: string;
  zipCode: string;
  address: string;
  city: string;
  state: string;
  paymentType: string;
  serviceType: string;
  clientId: string;
  isActive: boolean;
  dependents: any[];
}

interface BeneficiaryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cpf: string | null;
}

const BeneficiaryViewModal: React.FC<BeneficiaryViewModalProps> = ({
  isOpen,
  onClose,
  cpf,
}) => {
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);

  useEffect(() => {
    if (cpf) {
      getBeneficiaryDataByCpf(cpf).then((data) => {
        setBeneficiary(data);
      });
    }
  }, [cpf]);

  const getBeneficiaryDataByCpf = async (cpf: string) => {
    try {
      const response = await api.get(`/api/beneficiaries/cpf/${cpf}`);
      return response.data.beneficiary;
    } catch (error) {
      toast.error("Erro ao buscar beneficiário");
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    const paymentTypes: { [key: string]: string } = {
      S: "Recorrente",
      A: "Consulta",
    };
    return paymentTypes[type] || "Desconhecido";
  };

  const getServiceTypeLabel = (type: string) => {
    const serviceTypes: { [key: string]: string } = {
      G: "Clínico",
      P: "Psicologia",
      GP: "Clínico + Psicologia",
      GS: "Clínico + Especialista",
      GSP: "Clínico + Especialistas + Psicologia",
    };
    return serviceTypes[type] || "Desconhecido";
  };

  if (!beneficiary) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Beneficiário">
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">
            Nome
          </label>
          <p className="mt-1 text-gray-900">{beneficiary.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">CPF</label>
          <p className="mt-1 text-gray-900">{beneficiary.cpf}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">
            Data de Nascimento
          </label>
          <p className="mt-1 text-gray-900">
            {beneficiary.birthday || "Não informado"}
          </p>
        </div>

          <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">
            Telefone
          </label>
          <p className="mt-1 text-gray-900">
            {beneficiary.phone || "Não informado"}
          </p>
        </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">
            Email
          </label>
          <p className="mt-1 text-gray-900">
            {beneficiary.email || "Não informado"}
          </p>
        </div>

        

        <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">
            Cidade
          </label>
          <p className="mt-1 text-gray-900">
            {beneficiary.city || "Não informado"}
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">
            Estado
          </label>
          <p className="mt-1 text-gray-900">
            {beneficiary.state || "Não informado"}
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">CEP</label>
          <p className="mt-1 text-gray-900">
            {beneficiary.zipCode || "Não informado"}
          </p>
        </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">
            Endereço
          </label>
          <p className="mt-1 text-gray-900">
            {beneficiary.address || "Não informado"}
          </p>
        </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">
            Tipo de Pagamento
          </label>
          <p className="mt-1 text-gray-900">
            {getPaymentTypeLabel(beneficiary.paymentType)}
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <label className="block text-sm text-gray-700 font-bold">
            Tipo de Serviço
          </label>
          <p className="mt-1 text-gray-900">
            {getServiceTypeLabel(beneficiary.serviceType)}
          </p>
        </div>
      </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
};

export default BeneficiaryViewModal;
