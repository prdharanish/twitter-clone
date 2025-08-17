import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	createPost,
	deletePost,
	commentOnPost,
	likeUnlikePost,
	getAllPosts,
	getFollowingPosts,
	getLikedPosts,
	getUserPosts,
} from "../controllers/post.controller.js";

const router = express.Router();

// Fetch
router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);

// Actions
router.post("/create", protectRoute, createPost);
router.put("/like/:id", protectRoute, likeUnlikePost);     // ✅ CHANGED TO PUT
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/delete/:id", protectRoute, deletePost);

export default router;
