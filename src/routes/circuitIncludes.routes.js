import { Router } from "express";
import {
  getIncludesByCircuit,
  createCircuitInclude,
} from "../controllers/circuitIncludes.controller.js";

const router = Router();

router.get("/circuit/:circuitId", getIncludesByCircuit);
router.post("/", createCircuitInclude);

export default router;
