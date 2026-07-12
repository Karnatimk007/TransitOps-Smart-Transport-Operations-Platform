const prisma = require("../utils/prisma");

class BusinessRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = "BusinessRuleError";
    this.statusCode = 400;
  }
}

/**
 * Create a trip in DRAFT status. No status transitions happen yet —
 * vehicle/driver are only locked at dispatch time. Cargo capacity is
 * validated here since it never changes.
 */
async function createTrip({ source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, createdById }) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new BusinessRuleError("Vehicle not found");

  if (Number(cargoWeightKg) > Number(vehicle.maxLoadCapacityKg)) {
    throw new BusinessRuleError(
      `Cargo weight (${cargoWeightKg}kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacityKg}kg)`
    );
  }

  return prisma.trip.create({
    data: {
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeightKg,
      plannedDistanceKm,
      createdById,
      status: "DRAFT",
    },
  });
}

/**
 * Dispatch a DRAFT trip:
 *  - Vehicle must be Available (not Retired / In Shop / On Trip)
 *  - Driver must be Available, not Suspended, license not expired
 *  - Cargo must not exceed vehicle capacity (re-checked at dispatch time
 *    in case the vehicle assignment changed)
 * On success: Trip -> DISPATCHED, Vehicle -> ON_TRIP, Driver -> ON_TRIP
 * All checks + writes happen in a single transaction to avoid race conditions
 * (e.g. two trips dispatching against the same vehicle simultaneously).
 */
async function dispatchTrip(tripId) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });
    if (!trip) throw new BusinessRuleError("Trip not found");
    if (trip.status !== "DRAFT") {
      throw new BusinessRuleError(`Only DRAFT trips can be dispatched (current: ${trip.status})`);
    }

    const { vehicle, driver } = trip;

    if (vehicle.status === "RETIRED") throw new BusinessRuleError("Vehicle is retired and cannot be dispatched");
    if (vehicle.status === "IN_SHOP") throw new BusinessRuleError("Vehicle is in maintenance and cannot be dispatched");
    if (vehicle.status === "ON_TRIP") throw new BusinessRuleError("Vehicle is already on another trip");

    if (driver.status === "SUSPENDED") throw new BusinessRuleError("Driver is suspended and cannot be assigned");
    if (driver.status === "ON_TRIP") throw new BusinessRuleError("Driver is already on another trip");
    if (driver.status === "OFF_DUTY") throw new BusinessRuleError("Driver is off duty and cannot be assigned");
    if (new Date(driver.licenseExpiry) <= new Date()) {
      throw new BusinessRuleError("Driver's license has expired");
    }

    if (Number(trip.cargoWeightKg) > Number(vehicle.maxLoadCapacityKg)) {
      throw new BusinessRuleError("Cargo weight exceeds vehicle max load capacity");
    }

    const [updatedTrip] = await Promise.all([
      tx.trip.update({
        where: { id: tripId },
        data: { status: "DISPATCHED", dispatchedAt: new Date() },
      }),
      tx.vehicle.update({ where: { id: vehicle.id }, data: { status: "ON_TRIP" } }),
      tx.driver.update({ where: { id: driver.id }, data: { status: "ON_TRIP" } }),
    ]);

    return updatedTrip;
  });
}

/**
 * Complete a DISPATCHED trip.
 * On success: Trip -> COMPLETED, Vehicle -> AVAILABLE, Driver -> AVAILABLE,
 * vehicle odometer incremented by actualDistanceKm.
 */
async function completeTrip(tripId, { actualDistanceKm, fuelConsumedL, revenue }) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId }, include: { vehicle: true } });
    if (!trip) throw new BusinessRuleError("Trip not found");
    if (trip.status !== "DISPATCHED") {
      throw new BusinessRuleError(`Only DISPATCHED trips can be completed (current: ${trip.status})`);
    }

    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        actualDistanceKm,
        fuelConsumedL,
        revenue,
      },
    });

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        status: "AVAILABLE",
        odometerKm: Number(trip.vehicle.odometerKm) + Number(actualDistanceKm || 0),
      },
    });

    await tx.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } });

    if (fuelConsumedL) {
      await tx.fuelLog.create({
        data: {
          vehicleId: trip.vehicleId,
          liters: fuelConsumedL,
          cost: 0, // cost can be updated separately via the Fuel Log endpoint
          date: new Date(),
        },
      });
    }

    return updatedTrip;
  });
}

/**
 * Cancel a trip. Allowed from DRAFT or DISPATCHED.
 * If it was DISPATCHED, restores vehicle & driver to AVAILABLE.
 */
async function cancelTrip(tripId) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new BusinessRuleError("Trip not found");
    if (!["DRAFT", "DISPATCHED"].includes(trip.status)) {
      throw new BusinessRuleError(`Cannot cancel a trip with status ${trip.status}`);
    }

    const wasDispatched = trip.status === "DISPATCHED";

    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    if (wasDispatched) {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } });
    }

    return updatedTrip;
  });
}

module.exports = { createTrip, dispatchTrip, completeTrip, cancelTrip, BusinessRuleError };
