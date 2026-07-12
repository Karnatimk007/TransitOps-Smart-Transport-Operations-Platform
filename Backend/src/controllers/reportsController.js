const prisma = require("../utils/prisma");

// GET /dashboard?type=&status=&region=
async function dashboard(req, res) {
  const { type, region } = req.query;
  const vehicleWhere = { ...(type && { type }), ...(region && { region }) };

  const [
    activeVehicles,
    availableVehicles,
    inShopVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    totalVehicles,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { ...vehicleWhere, status: { not: "RETIRED" } } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: "IN_SHOP" } }),
    prisma.trip.count({ where: { status: "DISPATCHED" } }),
    prisma.trip.count({ where: { status: "DRAFT" } }),
    prisma.driver.count({ where: { status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: vehicleWhere }),
  ]);

  const onTripVehicles = await prisma.vehicle.count({ where: { ...vehicleWhere, status: "ON_TRIP" } });
  const fleetUtilizationPct = totalVehicles > 0 ? (onTripVehicles / totalVehicles) * 100 : 0;

  res.json({
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance: inShopVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilizationPct: Number(fleetUtilizationPct.toFixed(2)),
  });
}

// GET /reports/vehicle/:id — fuel efficiency, ROI, utilization for one vehicle
async function vehicleReport(req, res) {
  const { id } = req.params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

  const [fuelAgg, maintenanceAgg, tripsAgg] = await Promise.all([
    prisma.fuelLog.aggregate({ where: { vehicleId: id }, _sum: { liters: true, cost: true } }),
    prisma.maintenanceLog.aggregate({ where: { vehicleId: id }, _sum: { cost: true } }),
    prisma.trip.aggregate({
      where: { vehicleId: id, status: "COMPLETED" },
      _sum: { actualDistanceKm: true, revenue: true },
    }),
  ]);

  const totalFuelL = Number(fuelAgg._sum.liters || 0);
  const totalFuelCost = Number(fuelAgg._sum.cost || 0);
  const totalMaintenanceCost = Number(maintenanceAgg._sum.cost || 0);
  const totalDistanceKm = Number(tripsAgg._sum.actualDistanceKm || 0);
  const totalRevenue = Number(tripsAgg._sum.revenue || 0);
  const acquisitionCost = Number(vehicle.acquisitionCost);

  const fuelEfficiencyKmPerL = totalFuelL > 0 ? totalDistanceKm / totalFuelL : null;
  const operationalCost = totalFuelCost + totalMaintenanceCost;
  const roi = acquisitionCost > 0 ? (totalRevenue - operationalCost) / acquisitionCost : null;

  res.json({
    vehicleId: id,
    registrationNo: vehicle.registrationNo,
    fuelEfficiencyKmPerL: fuelEfficiencyKmPerL !== null ? Number(fuelEfficiencyKmPerL.toFixed(2)) : null,
    totalDistanceKm,
    totalFuelL,
    operationalCost: Number(operationalCost.toFixed(2)),
    totalRevenue,
    roi: roi !== null ? Number(roi.toFixed(4)) : null,
  });
}

// GET /reports/export.csv — flat CSV of all vehicles with key report metrics
async function exportCsv(req, res) {
  const vehicles = await prisma.vehicle.findMany();

  const rows = await Promise.all(
    vehicles.map(async (v) => {
      const [fuelAgg, maintenanceAgg, tripsAgg] = await Promise.all([
        prisma.fuelLog.aggregate({ where: { vehicleId: v.id }, _sum: { liters: true, cost: true } }),
        prisma.maintenanceLog.aggregate({ where: { vehicleId: v.id }, _sum: { cost: true } }),
        prisma.trip.aggregate({
          where: { vehicleId: v.id, status: "COMPLETED" },
          _sum: { actualDistanceKm: true, revenue: true },
        }),
      ]);
      const totalFuelL = Number(fuelAgg._sum.liters || 0);
      const totalDistanceKm = Number(tripsAgg._sum.actualDistanceKm || 0);
      const operationalCost = Number(fuelAgg._sum.cost || 0) + Number(maintenanceAgg._sum.cost || 0);
      const revenue = Number(tripsAgg._sum.revenue || 0);
      const roi = Number(v.acquisitionCost) > 0 ? (revenue - operationalCost) / Number(v.acquisitionCost) : "";
      const fuelEff = totalFuelL > 0 ? (totalDistanceKm / totalFuelL).toFixed(2) : "";

      return [
        v.registrationNo,
        v.name,
        v.type,
        v.status,
        totalDistanceKm,
        totalFuelL,
        operationalCost.toFixed(2),
        revenue,
        roi === "" ? "" : roi.toFixed(4),
        fuelEff,
      ].join(",");
    })
  );

  const header = "RegistrationNo,Name,Type,Status,TotalDistanceKm,TotalFuelL,OperationalCost,Revenue,ROI,FuelEfficiencyKmPerL";
  const csv = [header, ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=transitops_report.csv");
  res.send(csv);
}

module.exports = { dashboard, vehicleReport, exportCsv };
