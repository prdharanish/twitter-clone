// controllers/user.controller.js
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// Get user profile by username
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Follow/Unfollow a user
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(id);

    if (!currentUser || !targetUser)
      return res.status(404).json({ error: "User not found" });

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't follow/unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      currentUser.following.pull(id);
      targetUser.followers.pull(req.user._id);
    } else {
      currentUser.following.push(id);
      targetUser.followers.push(req.user._id);

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: targetUser._id,
      });
      await newNotification.save();
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: isFollowing ? "Unfollowed" : "Followed" });
  } catch (error) {
    console.error("Error in followUnfollowUser:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get suggested users
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowed = await User.findById(userId).select("following");
    const users = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowed.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((u) => (u.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Error in getSuggestedUsers:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  const {
    fullName,
    email,
    username,
    currentPassword,
    newPassword,
    bio,
    link,
    profileImg,
    coverImg,
  } = req.body;

  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ error: "Provide both current and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Wrong current password" });
      if (newPassword.length < 6) return res.status(400).json({ error: "New password too short" });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }
      const uploadRes = await cloudinary.uploader.upload(profileImg);
      user.profileImg = uploadRes.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }
      const uploadRes = await cloudinary.uploader.upload(coverImg);
      user.coverImg = uploadRes.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    await user.save();
    user.password = null;

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    res.status(500).json({ error: error.message });
  }
};
