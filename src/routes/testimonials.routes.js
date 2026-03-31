import express from "express";
import { getTestimonials } from "../controllers/testimonials.Controller.js";

const router = express.Router();

router.get("/", getTestimonials);

export default router;
