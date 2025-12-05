import { Router } from "express";
import {
  getImagesByCity,
  createCityImage,
} from "../controllers/cityImages.controller.js";

const router = Router();

router.get("/:cityId", getImagesByCity);
router.post("/", createCityImage);

export default router;
