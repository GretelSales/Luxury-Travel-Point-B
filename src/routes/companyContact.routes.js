import express from "express";
import { getCompanyInfo } from "../controllers/companyContact.controller.js";

const router = express.Router();

router.get("/", getCompanyInfo);

export default router;
