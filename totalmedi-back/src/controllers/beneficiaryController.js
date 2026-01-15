const api = require('../services/rapidocApi');
const axios = require('axios');
const pool = require('../config/database');

const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
const ASAAS_BASE_URL = 'https://api.asaas.com/v3';


async function getCustomerById(customerId) {
  try {
    const response = await axios.get(`${ASAAS_BASE_URL}/customers/${customerId}`, {
      headers: {
        access_token: ASAAS_API_KEY
      }
    });

    return response.data;
  } catch (err) {
    console.error('Erro ao buscar cliente Asaas:', err.response?.data || err.message);
    return null;
  }
}

class BeneficiaryController {
  async create(req, res) {
    try {
      console.log(req.body);
      const response = await api.post("/beneficiaries", [req.body]);
      res.json(response.data);
    } catch (error) {
      console.log(error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async createFromAsaas(req, res) {
    try {
      const event = req.body.event;
      const payment = req.body.payment;

      if (event === "PAYMENT_CONFIRMED") {
        const customerId = payment.customer;

        const cliente = await getCustomerById(customerId);

        if (cliente) {
          console.log("Cliente:", cliente);

          const beneficiary = {
            name: cliente.name,
            cpf: cliente.cpfCnpj,
            birthday: '1990-01-01',
            beneficiaryType: "titular",
            phone: cliente.mobilePhone || cliente.phone || '',
            email: cliente.email,
            zipCode: cliente.postalCode,
            address: cliente.address,
            city: cliente.cityName,
            state: cliente.state,
            paymentType: "A",
            serviceType: "G",
            holder: "",
            general: cliente.id
          }

          const response = await api.post("/beneficiaries", [beneficiary]);
          console.log("Beneficiário:", response.data);
          return res.json({
            success: true,
            message: "Beneficiário criado com sucesso",
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async getAll(req, res) {
    try {
      const response = await api.get("/beneficiaries");

      const dadosVendas = await getDadosVendas();

      let beneficiarios = response.data.beneficiaries.map(beneficiario => {
        const dadosVenda = dadosVendas.find(venda => venda.cpf_beneficiario == beneficiario.cpf);
        return {
          ...beneficiario,
          ...dadosVenda
        }
      });

      //if logger user is revendedor, return only the beneficiaries of the revendedor
      if(req.user.userType == "REVENDEDOR"){
        beneficiarios = beneficiarios.filter(beneficiario => beneficiario.id_revendedor == req.user.userId);
      }

      if(req.user.userType == "PARCEIRO"){
        beneficiarios = beneficiarios.filter(beneficiario => beneficiario.id_parceiro == req.user.userId);
      }

      if(req.user.userType == "FILIAL"){
        beneficiarios = beneficiarios.filter(beneficiario => beneficiario.id_filial == req.user.userId);
      }

      res.json({
        beneficiaries: beneficiarios,
      });
    } catch (error) {
      console.log(error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async getAllSales(req, res) {
      try {
        const dadosVendas = await getDadosVendas(); // A getDadosVendas original não precisa de filtros
        let beneficiarios = dadosVendas;

        // Filtros de permissão
        if(req.user.userType == "REVENDEDOR"){
          beneficiarios = beneficiarios.filter(beneficiario => beneficiario.id_revendedor == req.user.userId);
        }
        if(req.user.userType == "PARCEIRO"){
          beneficiarios = beneficiarios.filter(beneficiario => beneficiario.id_parceiro == req.user.userId);
        }
        if(req.user.userType == "FILIAL"){
          beneficiarios = beneficiarios.filter(beneficiario => beneficiario.id_filial == req.user.userId);
        }

        // A resposta volta a ser a lista de vendas brutas
        res.json({
          beneficiaries: beneficiarios,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }

  async getCommissionReport(req, res) {
    try {
      const { year, month, partnerId } = req.query;
      
      // Passa os filtros para a função que busca os dados
      const allSales = await getDadosVendas({ year, month, partnerId });
      let salesToProcess = allSales;

      // Filtros de permissão continuam funcionando
      if (req.user.userType === "REVENDEDOR") {
        salesToProcess = salesToProcess.filter(sale => sale.id_revendedor == req.user.userId);
      } else if (req.user.userType === "PARCEIRO") {
        salesToProcess = salesToProcess.filter(sale => sale.id_parceiro == req.user.userId);
      } else if (req.user.userType === "FILIAL") {
        salesToProcess = salesToProcess.filter(sale => sale.id_filial == req.user.userId);
      }

      const partnerCommissionsMap = new Map();
      const resellerCommissionsMap = new Map();

      salesToProcess.forEach(sale => {
        if (sale.nome_parceiro) {
          const existingPartner = partnerCommissionsMap.get(sale.nome_parceiro) || {
            id: sale.nome_parceiro, name: sale.nome_parceiro, totalSales: 0, commission: 0,
          };
          existingPartner.totalSales += Number(sale.valor) || 0;
          existingPartner.commission += Number(sale.comissao_parceiro) || 0;
          partnerCommissionsMap.set(sale.nome_parceiro, existingPartner);
        }
        if (sale.nome_revendedor && sale.nome_parceiro) {
          const existingReseller = resellerCommissionsMap.get(sale.nome_revendedor) || {
            id: sale.nome_revendedor, partner: sale.nome_parceiro, name: sale.nome_revendedor, totalSales: 0, commission: 0,
          };
          existingReseller.totalSales += Number(sale.valor) || 0;
          existingReseller.commission += Number(sale.comissao_revendedor) || 0;
          resellerCommissionsMap.set(sale.nome_revendedor, existingReseller);
        }
      });
      
      res.json({
        data: {
          partnerCommissions: Array.from(partnerCommissionsMap.values()),
          resellerCommissions: Array.from(resellerCommissionsMap.values()),
        }
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async getByCpf(req, res) {
    try {
      const { cpf } = req.params;
      const response = await api.get(`/beneficiaries/${cpf}`);
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async update(req, res) {
    try {
      const { uuid } = req.params;
      delete req.body.email;

      const data = {
        ...req.body,
        phone: req.body.phone.length > 11 ? req.body.phone.slice(2) : req.body.phone
      }

      const response = await api.put(`/beneficiaries/${uuid}`, data);
      res.json(response.data);
    } catch (error) {
      console.error(error.response?.data);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async delete(req, res) {
    try {
      const { uuid } = req.params;
      const response = await api.delete(`/beneficiaries/${uuid}`);
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async reactivate(req, res) {
    try {
      const { uuid } = req.params;
      const response = await api.put(`/beneficiaries/${uuid}/reactivate`);
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async requestAppointment(req, res) {
    try {
      const { uuid } = req.params;
      const response = await api.get(
        `/beneficiaries/${uuid}/request-appointment`
      );
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

}

async function getDadosVendas(filters = {}) {
  try {
    const connection = await pool.getConnection();
    try {
      let whereClauses = [];
      let queryParams = [];

      // Adiciona filtro de data se month e year forem fornecidos
      if (filters.month && filters.year) {
        whereClauses.push('MONTH(v.data_hora) = ? AND YEAR(v.data_hora) = ?');
        queryParams.push(filters.month, filters.year);
      }
      
      // Adiciona filtro de parceiro se partnerId for fornecido
      if (filters.partnerId) {
        whereClauses.push('p.id = ?');
        queryParams.push(filters.partnerId);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const [rows] = await connection.query(`
        SELECT 
          v.id, v.valor, v.tipo, v.data_hora,
          p.id as id_parceiro, p.nome as nome_parceiro,
          r.id as id_revendedor, r.nome as nome_revendedor,
          f.id as id_filial, f.titulo as nome_filial,
          COALESCE(cp.comissao_parceiro, 0) as comissao_parceiro,
          COALESCE(cp.comissao_revendedor, 0) as comissao_revendedor
        FROM venda v
        LEFT JOIN revendedor r ON v.id_revendedor = r.id
        LEFT JOIN filial f ON r.id_filial = f.id
        LEFT JOIN parceiro p ON f.id_parceiro = p.id
        LEFT JOIN comissao_plano cp ON p.id = cp.id_parceiro AND v.tipo = cp.plano
        ${whereSql}
        ORDER BY v.data_hora DESC
      `, queryParams);

      return rows;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return [];
  }
}

module.exports = new BeneficiaryController();