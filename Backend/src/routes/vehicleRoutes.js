const express = require("express");
const ctrl = require("../controllers/vehicleController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.get("/available", ctrl.listAvailable);
router.get("/:id", ctrl.get);
router.post("/", requireRole("FLEET_MANAGER"), ctrl.create);
router.put("/:id", requireRole("FLEET_MANAGER"), ctrl.update);
router.delete("/:id", requireRole("FLEET_MANAGER"), ctrl.remove); // "delete" = retire

module.exports = router;
