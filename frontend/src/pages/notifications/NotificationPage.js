import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const NotificationPage = () => {
	const queryClient = useQueryClient();

	// Fetch notifications
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const res = await fetch(`${baseUrl}/api/notifications`, {
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
	});

	// Delete notifications
	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${baseUrl}/api/notifications`, {
				method: "DELETE",
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen bg-black text-white">
			{/* Header */}
			<div className="flex justify-between items-center p-4 border-b border-gray-700">
				<p className="font-bold">Notifications</p>
				<div className="dropdown">
					<div tabIndex={0} role="button" className="m-1">
						<IoSettingsOutline className="w-4 text-white" />
					</div>
					<ul
						tabIndex={0}
						className="dropdown-content z-[1] menu p-2 shadow bg-gray-800 rounded-box w-52 text-white"
					>
						<li>
							<button onClick={deleteNotifications}>
								Delete all notifications
							</button>
						</li>
					</ul>
				</div>
			</div>

			{/* Loading Spinner */}
			{isLoading && (
				<div className="flex justify-center h-full items-center">
					<LoadingSpinner size="lg" />
				</div>
			)}

			{/* Empty state */}
			{notifications?.length === 0 && (
				<div className="text-center p-4 font-bold text-white">
					No notifications 🤔
				</div>
			)}

			{/* Notifications */}
			{notifications?.map((notification) => (
				<div
					className="border-b border-gray-700 text-white"
					key={notification._id}
				>
					<div className="flex gap-2 p-4">
						{/* Icon */}
						{notification.type === "follow" && (
							<FaUser className="w-7 h-7 text-primary" />
						)}
						{notification.type === "like" && (
							<FaHeart className="w-7 h-7 text-red-500" />
						)}

						{/* User link */}
						<Link
							to={`/profile/${notification.from.username}`}
							className="flex items-center gap-2"
						>
							<div className="avatar">
								<div className="w-8 rounded-full">
									<img
										src={
											notification.from.profileImg ||
											"/avatar-placeholder.png"
										}
										alt={`Profile of ${notification.from.username}`}
									/>
								</div>
							</div>
							<div className="flex gap-1 text-white">
								<span className="font-bold">
									@{notification.from.username}
								</span>{" "}
								{notification.type === "follow"
									? "followed you"
									: "liked your post"}
							</div>
						</Link>
					</div>
				</div>
			))}
		</div>
	);
};

export default NotificationPage;
