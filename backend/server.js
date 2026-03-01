import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import cloudinary from "cloudinary";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectDB from "./db/connectDB.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __filedir = path.dirname(__filename);

// Always load .env from the project root (one level up from /backend)
dotenv.config({ path: path.join(__filedir, "../.env") });
const __dirname = path.resolve();
// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS with credentials - allow any localhost port
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests from any localhost port or no origin (e.g. server-to-server)
			if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	})
);

// ✅ Increase payload limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/frontend/build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
//   });
// }


// Connect DB first, then start server
connectDB().then(() => {
	app.listen(PORT, () => {
		console.log(`🚀 Server is running on port ${PORT}`);
	});
});
