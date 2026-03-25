import { Router } from "express";
import { getPromoBanner } from "../controllers/promoBanner.controller.js";

const router = Router();

router.get("/", getPromoBanner);

export default router;
