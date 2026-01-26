import { Router } from "express";
import {getCircuitDays,getDaysByCircuit,createCircuitDay,} from "../controllers/circuitDays.controller.js";

const router = Router();

router.get("/", getCircuitDays);
router.get("/circuit/:circuitId", getDaysByCircuit);
router.post("/", createCircuitDay);

export default router;
