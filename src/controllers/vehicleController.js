const { z } = require("zod");
const prisma = require("../utils/prisma");

const vehicleSchema = z.object({
  registrationNo: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  maxLoadCapacityKg: z.number().positive(),
  odometerKm: z.number().nonnegative().optional(),
  acquisitionCost: z.number().nonnegative(),
  region: z.string().optional(),
});

// GET /vehicles?status=&type=&region=
async function list(req, res) {
  const { status, type, region } = req.query;
  const vehicles = await prisma.vehicle.findMany({
    where: {
      ...(status && { status }),
      ...(type && { type }),
      ...(region && { region }),
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(vehicles);
}

async function get(req, res) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  res.json(vehicle);
}

async function create(req, res) {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.vehicle.findUnique({
    where: { registrationNo: parsed.data.registrationNo },
  });
  if (existing) {
    return res.status(409).json({ error: "Registration number must be unique" });
  }

  const vehicle = await prisma.vehicle.create({ data: parsed.data });
  res.status(201).json(vehicle);
}

async function update(req, res) {
  const parsed = vehicleSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (parsed.data.registrationNo) {
    const dup = await prisma.vehicle.findFirst({
      where: {
        registrationNo: parsed.data.registrationNo,
        NOT: { id: req.params.id },
      },
    });
    if (dup) return res.status(409).json({ error: "Registration number must be unique" });
  }

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(vehicle);
  } catch (err) {
    res.status(404).json({ error: "Vehicle not found" });
  }
}

// Retiring a vehicle is a status change but guarded: cannot retire while On Trip
async function remove(req, res) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  if (vehicle.status === "ON_TRIP") {
    return res.status(400).json({ error: "Cannot retire a vehicle that is currently On Trip" });
  }
  const updated = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: { status: "RETIRED" },
  });
  res.json(updated);
}

// Vehicles eligible for dispatch selection (used by Trip creation form)
async function listAvailable(req, res) {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { name: "asc" },
  });
  res.json(vehicles);
}

module.exports = { list, get, create, update, remove, listAvailable };
