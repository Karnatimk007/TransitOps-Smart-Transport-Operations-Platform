const { z } = require("zod");
const prisma = require("../utils/prisma");
const tripService = require("../services/tripService");

const createSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  cargoWeightKg: z.number().positive(),
  plannedDistanceKm: z.number().positive(),
});

const completeSchema = z.object({
  actualDistanceKm: z.number().nonnegative(),
  fuelConsumedL: z.number().nonnegative().optional(),
  revenue: z.number().nonnegative().optional(),
});

function handleServiceError(err, res) {
  if (err instanceof tripService.BusinessRuleError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}

async function list(req, res) {
  const { status, vehicleId, driverId } = req.query;
  const trips = await prisma.trip.findMany({
    where: {
      ...(status && { status }),
      ...(vehicleId && { vehicleId }),
      ...(driverId && { driverId }),
    },
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(trips);
}

async function get(req, res) {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id },
    include: { vehicle: true, driver: true },
  });
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  res.json(trip);
}

async function create(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const trip = await tripService.createTrip({ ...parsed.data, createdById: req.user.id });
    res.status(201).json(trip);
  } catch (err) {
    handleServiceError(err, res);
  }
}

async function dispatch(req, res) {
  try {
    const trip = await tripService.dispatchTrip(req.params.id);
    res.json(trip);
  } catch (err) {
    handleServiceError(err, res);
  }
}

async function complete(req, res) {
  const parsed = completeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const trip = await tripService.completeTrip(req.params.id, parsed.data);
    res.json(trip);
  } catch (err) {
    handleServiceError(err, res);
  }
}

async function cancel(req, res) {
  try {
    const trip = await tripService.cancelTrip(req.params.id);
    res.json(trip);
  } catch (err) {
    handleServiceError(err, res);
  }
}

module.exports = { list, get, create, dispatch, complete, cancel };
