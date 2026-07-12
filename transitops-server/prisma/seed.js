const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      { name: "Fiona Fleet", email: "fleet@transitops.com", passwordHash, role: "FLEET_MANAGER" },
      { name: "Dave Driver", email: "driver@transitops.com", passwordHash, role: "DRIVER" },
      { name: "Sam Safety", email: "safety@transitops.com", passwordHash, role: "SAFETY_OFFICER" },
      { name: "Fay Finance", email: "finance@transitops.com", passwordHash, role: "FINANCIAL_ANALYST" },
    ],
  });

  await prisma.vehicle.upsert({
    where: { registrationNo: "VAN-05" },
    update: {},
    create: {
      registrationNo: "VAN-05",
      name: "Van-05",
      type: "Van",
      maxLoadCapacityKg: 500,
      odometerKm: 12000,
      acquisitionCost: 25000,
      status: "AVAILABLE",
      region: "North",
    },
  });

  await prisma.driver.upsert({
    where: { licenseNumber: "LIC-ALEX-001" },
    update: {},
    create: {
      name: "Alex",
      licenseNumber: "LIC-ALEX-001",
      licenseCategory: "LMV",
      licenseExpiry: new Date("2027-12-31"),
      contactNumber: "+91-9000000000",
      safetyScore: 95,
      status: "AVAILABLE",
      region: "North",
    },
  });

  console.log("Seed complete. Demo users password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
