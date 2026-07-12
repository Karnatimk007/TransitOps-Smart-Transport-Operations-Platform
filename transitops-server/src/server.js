require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const fuelExpenseRoutes = require("./routes/fuelExpenseRoutes");
const reportsRoutes = require("./routes/reportsRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api", fuelExpenseRoutes); // /api/fuel-logs, /api/expenses, /api/vehicles/:id/operational-cost
app.use("/api", reportsRoutes); // /api/dashboard, /api/reports/*

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Global error handler (catches anything thrown outside controllers)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`TransitOps API running on port ${PORT}`));
