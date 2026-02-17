import express from "express";
import { searchUsersController } from "../controllers/user.controller.js";

const router = express.Router();

/**
 * GET /users/search?q=searchTerm
 * Search for users by email or username
 * Public endpoint (no auth required)
 */
router.get('/search', searchUsersController);

export default router;
