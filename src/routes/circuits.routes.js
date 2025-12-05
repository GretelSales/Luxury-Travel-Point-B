import { Router } from "express";
import {
  getAllCircuits,
  getCircuitById,
  createCircuit,
  updateCircuit,
  deleteCircuit,
  getCircuitsFull,
  getAvailableCircuits,
} from "../controllers/circuits.controller.js";

const router = Router();

router.get("/full", getCircuitsFull);
router.get("/", getAllCircuits);
router.get("/available", getAvailableCircuits);
router.get("/:id", getCircuitById);
router.post("/", createCircuit);
router.put("/:id", updateCircuit);
router.delete("/:id", deleteCircuit);

export default router;
