const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

router.post("/parametros", settingsController.create);
router.get("/parametros", settingsController.getAll);
router.get("/parametros/:id", settingsController.getById);
router.put("/parametros/:id", settingsController.update);
router.delete("/parametros/:id", settingsController.delete);

// Rotas de Depoimentos
router.post("/depoimentos", settingsController.createDepoimento);
router.get("/depoimentos", settingsController.getAllDepoimentos);
router.get("/depoimentos/:id", settingsController.getDepoimentoById);
router.put("/depoimentos/:id", settingsController.updateDepoimento);
router.delete("/depoimentos/:id", settingsController.deleteDepoimento);
router.post("/depoimentos/reorder", settingsController.reorderDepoimentos);

module.exports = router;
