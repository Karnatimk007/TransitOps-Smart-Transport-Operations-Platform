const express = require("express");
const ctrl = require("../controllers/reportsController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/dashboard", ctrl.dashboard);
router.get("/reports/vehicle/:id", ctrl.vehicleReport);
router.get("/reports/export.csv", ctrl.exportCsv);

module.exports = router;
