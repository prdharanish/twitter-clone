import Notification from "../models/notification.model.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId })
      .sort({ createdAt: -1 })
      .populate("from", "username profileImg");

    await Notification.updateMany({ to: userId, read: false }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getNotifications:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete all notifications for a user
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotifications:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// (Optional) Create dummy notification for testing
export const createTestNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    const notification = await Notification.create({
      from: userId,
      to: userId, // testing purpose only
      type: "follow",
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error in createTestNotification:", error.message);
    res.status(500).json({ error: "Test notification creation failed" });
  }
};
