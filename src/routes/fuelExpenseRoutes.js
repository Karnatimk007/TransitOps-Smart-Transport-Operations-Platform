const express = require("express");
const ctrl = require("../controllers/fuelExpenseController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const canLog = requireRole("FLEET_MANAGER", "DRIVER");
const canView = requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST", "DRIVER", "SAFETY_OFFICER");

router.get("/fuel-logs", canView, ctrl.listFuelLogs);
router.post("/fuel-logs", canLog, ctrl.createFuelLog);

router.get("/expenses", canView, ctrl.listExpenses);
router.post("/expenses", canLog, ctrl.createExpense);

router.get("/vehicles/:vehicleId/operational-cost", canView, ctrl.operationalCost);

module.exports = router;
