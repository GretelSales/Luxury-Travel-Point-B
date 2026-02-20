import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import circuitsRoutes from "./routes/circuits.routes.js";
import citiesRoutes from "./routes/cities.routes.js";
import circuitDaysRoutes from "./routes/circuitDays.routes.js";
import cityImagesRoutes from "./routes/cityImages.routes.js";
import includeItemsRoutes from "./routes/includeItems.routes.js";
import circuitIncludesRoutes from "./routes/circuitIncludes.routes.js";
import authRoutes from "./routes/auth.routes.js";
import carsRoutes from "./routes/cars.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import serviceInterestRoutes from "./routes/servicesInterest.routes.js";

const app = express();
//https://luxury-travel-point-backend.vercel.app
app.use(
  cors({
    origin: "https://luxury-travel-point-backend.vercel.app",
  }),
);
app.use(express.json());

app.get("/", (req, res) =>
  res.json({ ok: true, name: "luxury-travel-point-backend" }),
);

app.use("/api", serviceInterestRoutes);
app.use("/api/circuits", circuitsRoutes);
app.use("/api/cities", citiesRoutes);
app.use("/api/circuit-days", circuitDaysRoutes);
app.use("/api/city-images", cityImagesRoutes);
app.use("/api/include-items", includeItemsRoutes);
app.use("/api/circuit-includes", circuitIncludesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api", servicesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
