import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

// Create Post
export const createPost = async (req, res) => {
	try {
		const { text, img } = req.body;
		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });
		if (!text && !img)
			return res.status(400).json({ error: "Post must have text or image" });

		let imageUrl = "";
		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			imageUrl = uploadedResponse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text,
			img: imageUrl,
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		console.error("Error in createPost:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
// DELETE /api/posts/delete/:id
export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		// Check if the user is the owner
		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		// If image exists, delete from cloudinary
		if (post.img) {
			const imgUrlParts = post.img.split("/");
			const publicIdWithExtension = imgUrlParts[imgUrlParts.length - 1]; // e.g. "abc123.jpg"
			const publicId = publicIdWithExtension.split(".")[0]; // e.g. "abc123"

			await cloudinary.uploader.destroy(publicId);
		}

		await post.deleteOne(); // or Post.findByIdAndDelete(post._id)
		return res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.error("Error in deletePost controller:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

// Comment on Post
// COMMENT ON POST
export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;

		if (!text?.trim()) {
			return res.status(400).json({ error: "Comment text cannot be empty" });
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = {
			user: req.user._id,
			text,
			createdAt: new Date()
		};

		post.comments.push(comment);
		await post.save();

		// Optionally send notification
		if (req.user._id.toString() !== post.user.toString()) {
			const notification = new Notification({
				from: req.user._id,
				to: post.user,
				type: "comment",
			});
			await notification.save();
		}

		// Populate comments and return updated post
		await post.populate("comments.user", "-password");
		res.status(200).json(post);
	} catch (error) {
		console.error("Error in commentOnPost:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};


// Like / Unlike
// LIKE / UNLIKE POST
export const likeUnlikePost = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user._id;

		const post = await Post.findById(id);
		if (!post) return res.status(404).json({ error: "Post not found" });

		const alreadyLiked = post.likes.includes(userId);

		if (alreadyLiked) {
			// Unlike
			post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
		} else {
			// Like
			post.likes.push(userId);
		}

		await post.save();
		res.status(200).json(post.likes);
	} catch (err) {
		console.error("Error in likeUnlikePost:", err);
		res.status(500).json({ error: "Server error" });
	}
};



// Get All Posts
export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate("user", "-password")
			.populate("comments.user", "-password");

		res.status(200).json(posts);
	} catch (error) {
		console.error("Error in getAllPosts:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get Liked Posts
export const getLikedPosts = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate("user", "-password")
			.populate("comments.user", "-password");

		res.status(200).json(likedPosts);
	} catch (error) {
		console.error("Error in getLikedPosts:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get Following Posts
export const getFollowingPosts = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: { $in: user.following } })
			.sort({ createdAt: -1 })
			.populate("user", "-password")
			.populate("comments.user", "-password");

		res.status(200).json(posts);
	} catch (error) {
		console.error("Error in getFollowingPosts:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get Posts by Username
export const getUserPosts = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate("user", "-password")
			.populate("comments.user", "-password");

		res.status(200).json(posts);
	} catch (error) {
		console.error("Error in getUserPosts:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
