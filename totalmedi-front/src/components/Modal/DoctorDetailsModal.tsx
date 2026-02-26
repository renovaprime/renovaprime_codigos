import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import api from "../../services/api";
import { toast } from "react-toastify";
import { FileIcon } from "lucide-react";

interface DoctorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any | null;
}

const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  isOpen,
  onClose,
  doctor,
}) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  if (!doctor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Profissional">
      <div className="space-y-4">
        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <p className="mt-1 text-gray-900">{doctor.nome_completo}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">CPF</label>
          <p className="mt-1 text-gray-900">{doctor.cpf}</p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Data de Nascimento
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.data_nascimento
              ? formatDate(doctor.data_nascimento)
              : "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Sexo
          </label>
          <p className="mt-1 text-gray-900">{doctor.sexo || "Não informado"}</p>
        </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">CRM</label>
          <p className="mt-1 text-gray-900">{doctor.crm || "Não informado"}</p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Estado do CRM
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.crm_estado || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">RQE</label>
          <p className="mt-1 text-gray-900">{doctor.rqe || "Não disponível"}</p>
        </div>
        </div>

       <div className="grid grid-cols-2 gap-4">
       <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Certificações
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.outras_certificacoes || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Especialidades
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.especialidades || "Não informado"}
          </p>
        </div>
       </div>

       <div className="grid grid-cols-3 gap-4">
       <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.email || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Telefone Celular
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.telefone_celular || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Telefone Comercial
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.telefone_comercial || "Não informado"}
          </p>
        </div>
       </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Endereço
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.rua}, {doctor.numero_complemento}, {doctor.bairro},{" "}
            {doctor.cidade}, {doctor.estado}, {doctor.cep}
          </p>
        </div>

       <div className="grid grid-cols-5 gap-4">
       <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Banco
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.banco || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Agência
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.agencia || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Conta Corrente
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.conta_corrente || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Conta
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.tipo_conta || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">PIX</label>
          <p className="mt-1 text-gray-900">{doctor.pix || "Não informado"}</p>
        </div>
       </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Horários
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.horarios_atendimento || "Não informado"}
          </p>
        </div>

       <div className="grid grid-cols-3 gap-4">
       <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Modalidade
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.modalidade_atendimento || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Idiomas
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.idiomas_falados || "Não informado"}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Tempo de Consulta
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.tempo_medio_consulta || "Não informado"}
          </p>
        </div>
       </div>

       <div className="grid grid-cols-4 gap-4">
       <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Foto
          </label>
          <p className="mt-1 text-gray-900">
            <a
              href={"https://totalmedi.com.br/" + doctor.foto_medico}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <FileIcon size={16} />
              Ver arquivo
            </a>
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Cópia do CRM
          </label>
          <p className="mt-1 text-gray-900">
            <a
              href={"https://totalmedi.com.br/" + doctor.copia_crm}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <FileIcon size={16} />
              Ver arquivo
            </a>
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Comp. de Especialidade
          </label>
          <p className="mt-1 text-gray-900">
            {doctor.comprovante_especialidade ? (
              <a
                href={
                  "https://totalmedi.com.br/" + doctor.comprovante_especialidade
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <FileIcon size={16} />
                Ver arquivo
              </a>
            ) : (
              "Não disponível"
            )}
          </p>
        </div>

        <div style={{ borderBottomWidth: 1 }} className="pb-2 bg-gray-100 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700">
            Termo de Aceite
          </label>
          <p className="mt-1 text-gray-900">
            <a
              href={"https://totalmedi.com.br/" + doctor.termo_aceite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <FileIcon size={16} />
              Ver arquivo
            </a>
          </p>
        </div>
        </div>


      </div>
    </Modal>
  );
};

export default DoctorDetailsModal;
