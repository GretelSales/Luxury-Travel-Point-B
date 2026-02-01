import express from "express";
import { getServicesContent } from "../controllers/services.controller.js";

const router = express.Router();

router.get("/services-content", getServicesContent);

export default router;
