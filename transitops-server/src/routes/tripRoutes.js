const express = require("express");
const ctrl = require("../controllers/tripController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const canManageTrips = requireRole("FLEET_MANAGER", "DRIVER");

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", canManageTrips, ctrl.create);
router.post("/:id/dispatch", canManageTrips, ctrl.dispatch);
router.post("/:id/complete", canManageTrips, ctrl.complete);
router.post("/:id/cancel", canManageTrips, ctrl.cancel);

module.exports = router;
