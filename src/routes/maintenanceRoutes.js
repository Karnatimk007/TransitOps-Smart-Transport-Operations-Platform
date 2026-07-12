const express = require("express");
const ctrl = require("../controllers/maintenanceController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.post("/", requireRole("FLEET_MANAGER"), ctrl.create);
router.post("/:id/close", requireRole("FLEET_MANAGER"), ctrl.close);

module.exports = router;
