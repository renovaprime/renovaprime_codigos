import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setLoading,
  setError,
} from '../store/slices/beneficiariesSlice';
import api from '../services/api';
import { toast } from 'react-toastify';
import { TrendingUp, DollarSign, Filter, Download } from 'lucide-react';
import * as XLSX from 'xlsx';


interface CommissionData {
  id: string;
  partner: string;
  name: string;
  totalSales: number;
  commission: number;
  percentage: number;
}


const CommissionReport: React.FC = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.beneficiaries);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [allPartnerNames, setAllPartnerNames] = useState<string[]>([]);
  const [partnerCommissions, setPartnerCommissions] = useState<CommissionData[]>([]);
  const [resellerCommissions, setResellerCommissions] = useState<CommissionData[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('');

  // Get user type and ID
  const userType = localStorage.getItem('userType');
  const isPartner = userType === 'PARCEIRO';
  const isBranch = userType === 'FILIAL';


  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        // Prepara os parâmetros para enviar na URL
        const params: any = {};
        if (selectedDate) {
          params.year = selectedDate.getFullYear();
          params.month = selectedDate.getMonth() + 1; // getMonth() é base 0, então adicionamos 1
        }
        if (selectedPartner) {
          params.partnerId = selectedPartner; // Assumindo que o value do select é o ID do parceiro
        }

        const response = await api.get("/api/commission-report", { params });
        const { partnerCommissions, resellerCommissions } = response.data.data

        setPartnerCommissions(partnerCommissions);
        setResellerCommissions(resellerCommissions);

        // A lista de parceiros para o filtro agora vem dos dados retornados
        const uniquePartners = Array.from(new Set(partnerCommissions.map((p: any) => p.name)));
        setAllPartnerNames(uniquePartners);
        
      } catch (error) {
        toast.error("Erro ao carregar relatório de comissões");
        dispatch(setError("Erro ao carregar relatório de comissões"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch, selectedDate, selectedPartner]);

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Export to Excel function
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Format data for Partner Commissions
    const partnerData = [
      ['Nome do Parceiro', 'Total de Vendas', 'Comissão'],
      ...partnerCommissions.map(commission => [
        commission.name,
        commission.totalSales,
        commission.commission
      ]),
      ['TOTAL', totalSales, partnerCommissions.reduce((acc, curr) => acc + curr.commission, 0)]
    ];

    // Format data for Reseller Commissions
    const resellerData = [
      ['Parceiro', 'Nome do Revendedor', 'Total de Vendas', 'Comissão'],
      ...resellerCommissions.map(commission => [
        commission.partner,
        commission.name,
        commission.totalSales,
        commission.commission
      ]),
      ['TOTAL', '', resellerCommissions.reduce((acc, curr) => acc + curr.totalSales, 0), resellerCommissions.reduce((acc, curr) => acc + curr.commission, 0)]
    ];

    // Create worksheets
    const wsPartners = XLSX.utils.aoa_to_sheet(partnerData);
    const wsResellers = XLSX.utils.aoa_to_sheet(resellerData);

    // Set column widths
    wsPartners['!cols'] = [
      { wch: 30 }, // Nome do Parceiro
      { wch: 15 }, // Total de Vendas
      { wch: 15 }, // Comissão
    ];

    wsResellers['!cols'] = [
      { wch: 30 }, // Nome do Revendedor
      { wch: 15 }, // Total de Vendas
      { wch: 15 }, // Comissão
    ];

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, wsPartners, 'Comissões por Parceiro');
    XLSX.utils.book_append_sheet(wb, wsResellers, 'Comissões por Revendedor');

    // Generate filename with current date
    const currentDate = selectedDate || new Date();
    const monthYear = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}`;
    const filename = `relatorio-comissoes-${monthYear}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    toast.success('Relatório exportado com sucesso!');
  };

  // Calculate totals
  const currentCommissions = activeTab === 0 ? partnerCommissions : resellerCommissions;
  const totalSales = currentCommissions.reduce((acc, curr) => acc + curr.totalSales, 0);
  const totalCommissions = currentCommissions.reduce((acc, curr) => acc + curr.commission, 0);

  const clearFilters = () => {
    setSelectedPartner('');
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Relatório de Comissões {isPartner ? "do Parceiro" : isBranch ? "da Filial" : ""}
        </h1>
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download size={16} />
          <span>Exportar para Excel</span>
        </button>
      </div>

      {/* Indicator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Comissões</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCommissions)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o Mês
            </label>
            <input
              type="month"
              value={selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}` : ''}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setSelectedDate(new Date(parseInt(year), parseInt(month) - 1));
              }}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            />
          </div>

          {!isPartner && !isBranch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parceiro
              </label>
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
              >
                <option value="">Todos os Parceiros</option>
                {allPartnerNames.map((partner) => (
                  <option key={partner} value={partner}>
                    {partner}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(selectedPartner || selectedDate) && (
            <div className='flex items-end justify-start align-middle pb-2'>
              <button
                onClick={clearFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm"
              >
                <Filter size={14} />
                <span>Limpar Filtros</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => handleTabChange(0)}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 0
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Comissões por Parceiro
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 1
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Comissões por Revendedor
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total de Vendas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comissão
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCommissions.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(row.totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(row.commission)}
                    </td>
                  </tr>
                ))}
                {currentCommissions.length > 0 && (
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(totalCommissions)}
                    </td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
                  )}
        </div>
      </div>
  );
};

export default CommissionReport; 