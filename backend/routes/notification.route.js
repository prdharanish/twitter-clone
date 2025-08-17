import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getNotifications,
  deleteNotifications,
  createTestNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Fetch all notifications
router.get("/", protectRoute, getNotifications);

// Delete all notifications
router.delete("/", protectRoute, deleteNotifications);

// Create test notification (optional)
router.post("/test-create", protectRoute, createTestNotification);

export default router;
