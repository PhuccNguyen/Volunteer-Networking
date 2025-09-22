import express from "express";
import { login } from "../controllers/auth.js";
import { sanitizeInput, validateLogin, validateRegistration } from "../middleware/validation.js";

const router = express.Router(); // Corrected `route` to `router`

router.post("/login", sanitizeInput, validateLogin, login); // Using `router` instead of `route`

export default router; // Exporting `router` instead of `route`
