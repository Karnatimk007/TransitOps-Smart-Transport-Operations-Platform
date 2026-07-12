const { z } = require("zod");
const prisma = require("../utils/prisma");

const driverSchema = z.object({
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseCategory: z.string().min(1),
  licenseExpiry: z.coerce.date(),
  contactNumber: z.string().min(1),
  safetyScore: z.number().int().min(0).max(100).optional(),
  region: z.string().optional(),
});

async function list(req, res) {
  const { status, region } = req.query;
  const drivers = await prisma.driver.findMany({
    where: {
      ...(status && { status }),
      ...(region && { region }),
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(drivers);
}

async function get(req, res) {
  const driver = await prisma.driver.findUnique({ where: { id: req.params.id } });
  if (!driver) return res.status(404).json({ error: "Driver not found" });
  res.json(driver);
}

async function create(req, res) {
  const parsed = driverSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.driver.findUnique({
    where: { licenseNumber: parsed.data.licenseNumber },
  });
  if (existing) return res.status(409).json({ error: "License number must be unique" });

  const driver = await prisma.driver.create({ data: parsed.data });
  res.status(201).json(driver);
}

async function update(req, res) {
  const parsed = driverSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(driver);
  } catch (err) {
    res.status(404).json({ error: "Driver not found" });
  }
}

async function suspend(req, res) {
  const driver = await prisma.driver.update({
    where: { id: req.params.id },
    data: { status: "SUSPENDED" },
  });
  res.json(driver);
}

async function reinstate(req, res) {
  const driver = await prisma.driver.update({
    where: { id: req.params.id },
    data: { status: "AVAILABLE" },
  });
  res.json(driver);
}

// Drivers eligible for dispatch: Available AND license not expired
async function listAvailable(req, res) {
  const drivers = await prisma.driver.findMany({
    where: {
      status: "AVAILABLE",
      licenseExpiry: { gt: new Date() },
    },
    orderBy: { name: "asc" },
  });
  res.json(drivers);
}

module.exports = { list, get, create, update, suspend, reinstate, listAvailable };
