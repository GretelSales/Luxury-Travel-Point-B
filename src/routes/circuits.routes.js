import { Router } from "express";
import {
  getAllCircuits,
  getCircuitById,
  createCircuit,
  updateCircuit,
  deleteCircuit,
  getCircuitsFull,
  getAvailableCircuits,
  getCircuitFullById,
} from "../controllers/circuits.controller.js";

const router = Router();

router.get("/full", getCircuitsFull);
router.get("/:id/fullById", getCircuitFullById);
router.get("/", getAllCircuits);
router.get("/:id", getCircuitById);
router.post("/", createCircuit);
router.put("/:id", updateCircuit);
router.delete("/:id", deleteCircuit);
router.get("/available", getAvailableCircuits);

export default router;
