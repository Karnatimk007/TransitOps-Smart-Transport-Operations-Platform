const { z } = require("zod");
const prisma = require("../utils/prisma");

const fuelSchema = z.object({
  vehicleId: z.string().min(1),
  liters: z.number().positive(),
  cost: z.number().nonnegative(),
  date: z.coerce.date().optional(),
});

const expenseSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.enum(["TOLL", "MAINTENANCE", "OTHER"]),
  amount: z.number().nonnegative(),
  date: z.coerce.date().optional(),
  notes: z.string().optional(),
});

async function createFuelLog(req, res) {
  const parsed = fuelSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const log = await prisma.fuelLog.create({ data: parsed.data });
  res.status(201).json(log);
}

async function listFuelLogs(req, res) {
  const { vehicleId } = req.query;
  const logs = await prisma.fuelLog.findMany({
    where: { ...(vehicleId && { vehicleId }) },
    orderBy: { date: "desc" },
  });
  res.json(logs);
}

async function createExpense(req, res) {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const expense = await prisma.expense.create({ data: parsed.data });
  res.status(201).json(expense);
}

async function listExpenses(req, res) {
  const { vehicleId, type } = req.query;
  const expenses = await prisma.expense.findMany({
    where: { ...(vehicleId && { vehicleId }), ...(type && { type }) },
    orderBy: { date: "desc" },
  });
  res.json(expenses);
}

// Operational cost per vehicle = total fuel cost + total maintenance-type expense cost + maintenance log costs
async function operationalCost(req, res) {
  const { vehicleId } = req.params;

  const [fuelAgg, expenseAgg, maintenanceAgg] = await Promise.all([
    prisma.fuelLog.aggregate({ where: { vehicleId }, _sum: { cost: true } }),
    prisma.expense.aggregate({ where: { vehicleId }, _sum: { amount: true } }),
    prisma.maintenanceLog.aggregate({ where: { vehicleId }, _sum: { cost: true } }),
  ]);

  const fuelCost = Number(fuelAgg._sum.cost || 0);
  const expenseCost = Number(expenseAgg._sum.amount || 0);
  const maintenanceCost = Number(maintenanceAgg._sum.cost || 0);

  res.json({
    vehicleId,
    fuelCost,
    expenseCost,
    maintenanceCost,
    totalOperationalCost: fuelCost + expenseCost + maintenanceCost,
  });
}

module.exports = {
  createFuelLog,
  listFuelLogs,
  createExpense,
  listExpenses,
  operationalCost,
};
