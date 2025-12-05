import { Router } from "express";
import {
  getIncludeItems,
  createIncludeItem,
} from "../controllers/includeItems.controller.js";

const router = Router();

router.get("/", getIncludeItems);
router.post("/", createIncludeItem);

export default router;
