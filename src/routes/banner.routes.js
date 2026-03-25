import { Router } from "express";
import { getPromoBanner } from "../controllers/banner.controller.js";

const router = Router();

router.get("/", getPromoBanner);

export default router;
