const { z } = require("zod");
const prisma = require("../utils/prisma");

const createSchema = z.object({
  vehicleId: z.string().min(1),
  description: z.string().min(1),
  cost: z.number().nonnegative(),
});

async function list(req, res) {
  const { vehicleId, isActive } = req.query;
  const logs = await prisma.maintenanceLog.findMany({
    where: {
      ...(vehicleId && { vehicleId }),
      ...(isActive !== undefined && { isActive: isActive === "true" }),
    },
    include: { vehicle: true },
    orderBy: { startedAt: "desc" },
  });
  res.json(logs);
}

// Opening a maintenance record: vehicle must not already be On Trip.
// Sets vehicle status -> IN_SHOP, removing it from dispatch pool.
async function create(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: parsed.data.vehicleId } });
      if (!vehicle) throw new Error("Vehicle not found");
      if (vehicle.status === "ON_TRIP") {
        throw new Error("Cannot open a maintenance record for a vehicle that is On Trip");
      }

      const log = await tx.maintenanceLog.create({
        data: { ...parsed.data, isActive: true },
      });

      await tx.vehicle.update({
        where: { id: parsed.data.vehicleId },
        data: { status: "IN_SHOP" },
      });

      return log;
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Closing maintenance: restores vehicle to AVAILABLE, unless it's Retired.
async function close(req, res) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.findUnique({ where: { id: req.params.id } });
      if (!log) throw new Error("Maintenance record not found");
      if (!log.isActive) throw new Error("Maintenance record already closed");

      const updatedLog = await tx.maintenanceLog.update({
        where: { id: req.params.id },
        data: { isActive: false, closedAt: new Date() },
      });

      const vehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId } });
      if (vehicle.status !== "RETIRED") {
        await tx.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: "AVAILABLE" },
        });
      }

      return updatedLog;
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { list, create, close };
