const express = require("express");
const ctrl = require("../controllers/driverController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.get("/available", ctrl.listAvailable);
router.get("/:id", ctrl.get);
router.post("/", requireRole("FLEET_MANAGER"), ctrl.create);
router.put("/:id", requireRole("FLEET_MANAGER"), ctrl.update);
router.post("/:id/suspend", requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), ctrl.suspend);
router.post("/:id/reinstate", requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), ctrl.reinstate);

module.exports = router;
