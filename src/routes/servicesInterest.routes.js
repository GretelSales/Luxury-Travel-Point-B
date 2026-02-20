import express from "express";
import { createServiceInterest } from "../controllers/serviceInterest.controller.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";

const router = express.Router();

// acepta usuarios logeados o no
router.post("/service-interest", optionalAuth, createServiceInterest);

export default router;
