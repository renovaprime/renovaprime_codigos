const api = require("../services/rapidocApi");

class AppointmentController {
  async create(req, res) {
    try {
      const response = await api.post("/appointments", req.body);
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async createWithReferral(req, res) {
    try {
      const response = await api.post("/appointments", req.body);
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async getAll(req, res) {
    const startTime = new Date();
    try {
      const response = await api.get("/appointments");
      const endTime = new Date();
      console.log(`Tempo de execução: ${endTime - startTime}ms`);
      res.json(response.data);
    } catch (error) {
      const endTime = new Date();
      console.log(`Tempo de execução até o erro: ${endTime - startTime}ms`);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async getById(req, res) {
    try {
      const { uuid } = req.params;
      const response = await api.get(`/appointments/${uuid}`);
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async cancel(req, res) {
    try {
      const { uuid } = req.params;
      const response = await api.delete(`/appointments/${uuid}`);
      console.log(response);
      res.json(response.data);
    } catch (error) {
      console.log(error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async getSpecialties(req, res) {
    try {
      const response = await api.get("/specialties");

      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async getAvailability(req, res) {
    const { specialtyUuid, dateInitial, dateFinal, beneficiaryUuid } =
      req.query;

    try {
      const response = await api.get("/specialty-availability", {
        headers: {
          clientId: process.env.CLIENT_ID,
          Authorization: `Bearer ${process.env.TOKEN}`,
          "Content-Type": "application/vnd.rapidoc.tema-v2+json",
        },
        params: {
          specialtyUuid,
          dateInitial: dateInitial
            ? dateInitial.split("-").reverse().join("/")
            : null,
          dateFinal: dateFinal
            ? dateFinal.split("-").reverse().join("/")
            : null,
          beneficiaryUuid,
        },
      });

      res.json(response.data);
    } catch (error) {
      console.log(error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }

  async getAllReferrals(req, res) {
    try {
      const response = await api.get("/beneficiary-medical-referrals");
      res.json(response.data);
    } catch (error) {
      console.log(error);
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }
}

module.exports = new AppointmentController();
