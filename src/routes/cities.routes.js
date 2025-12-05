import { Router } from "express";
import {
  getAllCities,
  getCityById,
  createCity,
  getUniqueCountries,
  getCircuitsByCountry,
} from "../controllers/cities.controller.js";

const router = Router();

router.get("/countries", getUniqueCountries);
router.get("/by-country/:country", getCircuitsByCountry);
router.get("/", getAllCities);
router.get("/:id", getCityById);
router.post("/", createCity);

export default router;
