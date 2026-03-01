import express from "express";
import {
  getUserProfile,
  getSuggestedUsers,
  followUnfollowUser,
  updateUser,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Get profile by username (protected route)
router.get("/profile/:username", protectRoute, getUserProfile);

// Get suggested users for follow (protected route)
router.get("/suggested", protectRoute, getSuggestedUsers);

// Follow or unfollow a user by ID (protected route)
router.post("/follow/:id", protectRoute, followUnfollowUser);

// Update profile (protected route)
router.post("/update", protectRoute, updateUser);

export default router;
