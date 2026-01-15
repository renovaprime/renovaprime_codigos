import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  setLoading,
  setError,
} from "../store/slices/beneficiariesSlice";
import api from "../services/api";
import { toast } from "react-toastify";
import { Filter, TrendingUp, DollarSign, Calendar, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import Pagination from "../components/Pagination";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Sale {
  id: string;
  nome_revendedor: string;
  nome_filial: string;
  nome_parceiro: string;
  cpf_beneficiario: string;
  tipo: string;
  valor: number;
  data_hora: string;
}

interface Beneficiary {
  id: string;
  nome_revendedor: string;
  nome_filial: string;
  nome_parceiro: string;
  cpf_beneficiario: string;
  tipo: string;
  valor: number;
  data_hora: string;
}

const SalesReport = () => {
  const dispatch = useDispatch();
  const { beneficiaries, loading } = useSelector(
    (state: RootState) => state.beneficiaries
  );
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    reseller: "",
    branch: "",
    partner: "",
    type: "",
    month: "",
  });

  // Get user type and ID
  const userType = localStorage.getItem('userType');
  const userId = localStorage.getItem('userId');
  const isPartner = userType === 'PARCEIRO';
  const isBranch = userType === 'FILIAL';

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPartnerPage, setCurrentPartnerPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calculate metrics
  const salesWithReseller = sales.filter(sale => sale.nome_revendedor);
  const totalSales = salesWithReseller.length;
  const totalValue = salesWithReseller.reduce((acc, sale) => acc + (Number(sale.valor) || 0), 0);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const salesLast30Days = salesWithReseller.filter(sale => {
    const saleDate = new Date(sale.data_hora);
    return saleDate >= thirtyDaysAgo && !isNaN(saleDate.getTime());
  });
  const totalValueLast30Days = salesLast30Days.reduce((acc, sale) => acc + (Number(sale.valor) || 0), 0);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const salesLast7Days = salesWithReseller.filter(sale => {
    const saleDate = new Date(sale.data_hora);
    return saleDate >= sevenDaysAgo && !isNaN(saleDate.getTime());
  });
  const totalValueLast7Days = salesLast7Days.reduce((acc, sale) => acc + (Number(sale.valor) || 0), 0);

  // Get unique values for filters
  const uniqueResellers = Array.from(new Set(sales.map(s => s.nome_revendedor).filter(Boolean)));
  const uniqueBranches = Array.from(new Set(sales.map(s => s.nome_filial).filter(Boolean)));
  const uniquePartners = Array.from(new Set(sales.map(s => s.nome_parceiro).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(sales.map(s => s.tipo).filter(Boolean)));

  // Get current sales for pagination
  const indexOfLastSale = currentPage * itemsPerPage;
  const indexOfFirstSale = indexOfLastSale - itemsPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  // Partner sales calculations
  const partnerSales = Array.from(new Set(salesWithReseller.map(sale => sale.nome_parceiro)))
    .filter(Boolean)
    .map(partner => {
      const partnerSales = salesWithReseller.filter(sale => sale.nome_parceiro === partner);
      const totalPartnerValue = partnerSales.reduce((acc, sale) => acc + (Number(sale.valor) || 0), 0);
      const averageValue = partnerSales.length > 0 ? totalPartnerValue / partnerSales.length : 0;

      return {
        partner,
        totalSales: partnerSales.length,
        totalValue: totalPartnerValue,
        averageValue
      };
    });

  // Partner pagination
  const indexOfLastPartner = currentPartnerPage * itemsPerPage;
  const indexOfFirstPartner = indexOfLastPartner - itemsPerPage;
  const currentPartners = partnerSales.slice(indexOfFirstPartner, indexOfLastPartner);
  const totalPartnerPages = Math.ceil(partnerSales.length / itemsPerPage);

  const hasFilters = searchTerm.trim() !== "" || 
    filters.reseller !== "" || 
    filters.branch !== "" || 
    filters.partner !== "" ||
    filters.type !== "";

    const convertTipo = (tipo: string) => {
      if (tipo === 'consulta_avulsa') {
        return 'Consulta Avulsa';
      } else if (tipo === 'plano_individual') {
        return 'Consulta Clínico Geral';
      } else if (tipo === 'plano_individual_premium') {
        return 'Plano Individual Premium';
      } else if (tipo === 'plano_familiar') {
        return 'Plano Familiar Premium';
      } 
    }

  // Chart data preparation
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  // Pie chart data for partners
  const partnerChartData = partnerSales.map((partner, index) => ({
    name: partner.partner,
    value: partner.totalSales,
    color: COLORS[index % COLORS.length]
  }));

  // Bar chart data for branches
  const branchData = Array.from(new Set(salesWithReseller.map(sale => sale.nome_filial)))
    .filter(Boolean)
    .map(branch => {
      const branchSales = salesWithReseller.filter(sale => sale.nome_filial === branch);
      return {
        name: branch,
        vendas: branchSales.length,
      };
    })
    .sort((a, b) => b.vendas - a.vendas);

  // Bar chart data for resellers
  const resellerData = Array.from(new Set(salesWithReseller.map(sale => sale.nome_revendedor)))
    .filter(Boolean)
    .map(reseller => {
      const resellerSales = salesWithReseller.filter(sale => sale.nome_revendedor === reseller);
      return {
        name: reseller,
        vendas: resellerSales.length,
      };
    })
    .sort((a, b) => b.vendas - a.vendas)
    .slice(0, 10); // Show top 10 resellers

  // Custom tooltip for currency formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Add function to get last 12 months
  const getLast12Months = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const monthYearValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label: monthYear, value: monthYearValue });
    }
    
    return months;
  };

  useEffect(() => {
    const fetchSales = async () => {
      dispatch(setLoading(true));
      try {
        const response = await api.get("/api/beneficiaries-report");
        // Transform beneficiaries data into sales data
        let salesData = response.data.beneficiaries.map((beneficiary: Beneficiary) => ({
          id: beneficiary.id,
          nome_revendedor: beneficiary.nome_revendedor,
          nome_filial: beneficiary.nome_filial,
          nome_parceiro: beneficiary.nome_parceiro,
          cpf_beneficiario: beneficiary.cpf_beneficiario,
          tipo: convertTipo(beneficiary.tipo),
          valor: beneficiary.valor,
          data_hora: beneficiary.data_hora,
        }));

        setSales(salesData);
        setFilteredSales(salesData);
      } catch (error) {
        toast.error("Erro ao carregar relatório de vendas");
        dispatch(setError("Erro ao carregar relatório de vendas"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchSales();
  }, [dispatch, isPartner, isBranch, userId]);

  useEffect(() => {
    const filtered = sales.filter((sale) => {
      const searchMatch = 
        sale.nome_revendedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.nome_filial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.nome_parceiro?.toLowerCase().includes(searchTerm.toLowerCase());

      const resellerMatch = !filters.reseller || sale.nome_revendedor === filters.reseller;
      const branchMatch = !filters.branch || sale.nome_filial === filters.branch;
      const partnerMatch = !filters.partner || sale.nome_parceiro === filters.partner;
      const typeMatch = !filters.type || sale.tipo === filters.type;
      
      // Updated month filter logic with safe date handling
      const saleDate = new Date(sale.data_hora);
      const monthMatch = !filters.month || 
        (saleDate instanceof Date && !isNaN(saleDate.getTime()) && 
         `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}` === filters.month);

      return searchMatch && resellerMatch && branchMatch && partnerMatch && typeMatch && monthMatch;
    });

    setFilteredSales(filtered);
    setCurrentPage(1);
  }, [searchTerm, sales, filters]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      reseller: "",
      branch: "",
      partner: "",
      type: "",
      month: "",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Export to Excel function
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Format data for Sales Report
    const salesData = [
      ['Revendedor', 'Filial', 'Parceiro', 'CPF do Beneficiário', 'Tipo', 'Valor', 'Data'],
      ...filteredSales.map(sale => [
        sale.nome_revendedor || '-',
        sale.nome_filial || '-',
        sale.nome_parceiro || '-',
        sale.cpf_beneficiario || '-',
        sale.tipo || '-',
        Number(sale.valor) || 0,
        formatDate(sale.data_hora)
      ]),
      ['TOTAL', '', '', '', filteredSales.reduce((acc, sale) => acc + (Number(sale.valor) || 0), 0), '']
    ];

    // Create worksheet
    const wsSales = XLSX.utils.aoa_to_sheet(salesData);

    // Set column widths
    wsSales['!cols'] = [
      { wch: 25 }, // Revendedor
      { wch: 25 }, // Filial
      { wch: 25 }, // Parceiro
      { wch: 20 }, // CPF
      { wch: 20 }, // Tipo
      { wch: 15 }, // Valor
      { wch: 20 }  // Data
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, wsSales, 'Relatório de Vendas');

    // Generate filename with current date
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    const filename = `relatorio-vendas-${dateStr}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    toast.success('Relatório exportado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          Relatório de Vendas {isPartner ? "do Parceiro" : isBranch ? "da Filial" : ""}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Últimos 30 dias</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValueLast30Days)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Últimos 7 dias</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValueLast7Days)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Calendar className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Sales by Partner */}
        {!isBranch && partnerChartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Parceiro</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={partnerChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {partnerChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [Number(value), 'Vendas']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart - Sales by Branch */}
        {!isBranch && branchData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Filial</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="vendas" fill="#8884d8" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bar Chart - Sales by Reseller (Full Width) */}
      {resellerData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Revendedores</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={resellerData} margin={{ top: 5, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="vendas" fill="#8884d8" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sales by Partner Table */}
      {!isBranch && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vendas por Parceiro</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parceiro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade de Vendas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                 
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPartners.map(({ partner, totalSales, totalValue, averageValue }) => (
                  <tr key={partner} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {partner || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {totalSales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(totalValue)}
                    </td>
                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Partner Table Pagination */}
          {partnerSales.length > 0 && (
            <div className="p-4">
              <Pagination 
                currentPage={currentPartnerPage}
                totalPages={totalPartnerPages}
                onPageChange={setCurrentPartnerPage}
                totalRecords={partnerSales.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
       

        {/* Only show partner filter for admin users */}
        {!isPartner && !isBranch && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parceiro
            </label>
            <select
              value={filters.partner}
              onChange={(e) => setFilters(prev => ({ ...prev, partner: e.target.value }))}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            >
              <option value="">Todos</option>
              {uniquePartners.map((partner) => (
                <option key={partner} value={partner}>
                  {partner}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Only show branch filter for admin and partner users */}
        {!isBranch && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filial
            </label>
            <select
              value={filters.branch}
              onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
            >
              <option value="">Todas</option>
              {uniqueBranches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Revendedor
          </label>
          <select
            value={filters.reseller}
            onChange={(e) => setFilters(prev => ({ ...prev, reseller: e.target.value }))}
            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
          >
            <option value="">Todos</option>
            {uniqueResellers.map((reseller) => (
              <option key={reseller} value={reseller}>
                {reseller}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
          >
            <option value="">Todos</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mês
          </label>
          <select
            value={filters.month}
            onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
            className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 shadow-sm p-2"
          >
            <option value="">Todos</option>
            {getLast12Months().map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Botão para limpar filtros */}
        {hasFilters && (
          <div className="flex items-end">
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
                  Revendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parceiro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.nome_revendedor || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.nome_filial || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.nome_parceiro || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.cpf_beneficiario || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.tipo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(sale.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sale.data_hora)}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              {currentSales.length > 0 && (
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    Total:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(currentSales.reduce((acc, sale) => acc + (Number(sale.valor) || 0), 0))}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filteredSales.length > 0 && (
            <div className="p-4">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalRecords={filteredSales.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesReport; 