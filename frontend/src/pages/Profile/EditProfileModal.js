import { useEffect, useState } from "react";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

const EditProfileModal = ({ authUser }) => {
	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});

	const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

	useEffect(() => {
		if (authUser) {
			setFormData({
				fullName: authUser.fullName || "",
				username: authUser.username || "",
				email: authUser.email || "",
				bio: authUser.bio || "",
				link: authUser.link || "",
				newPassword: "",
				currentPassword: "",
			});
		}
	}, [authUser]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		updateProfile(formData);
	};

	return (
		<>
			<button
				className="btn btn-outline rounded-full btn-sm"
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit Profile
			</button>

			<dialog id="edit_profile_modal" className="modal">
				<div className="modal-box border border-gray-700 shadow-lg rounded-md">
					<h3 className="font-bold text-lg mb-4">Edit Your Profile</h3>

					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div className="flex flex-wrap gap-2">
							<input
								type="text"
								placeholder="Full Name"
								name="fullName"
								value={formData.fullName}
								onChange={handleInputChange}
								className="flex-1 input border border-gray-700 p-2 rounded input-md"
							/>
							<input
								type="text"
								placeholder="Username"
								name="username"
								value={formData.username}
								onChange={handleInputChange}
								className="flex-1 input border border-gray-700 p-2 rounded input-md"
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							<input
								type="email"
								placeholder="Email"
								name="email"
								value={formData.email}
								onChange={handleInputChange}
								className="flex-1 input border border-gray-700 p-2 rounded input-md"
							/>
							<textarea
								placeholder="Bio"
								name="bio"
								value={formData.bio}
								onChange={handleInputChange}
								className="flex-1 textarea border border-gray-700 p-2 rounded input-md"
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							<input
								type="password"
								placeholder="Current Password"
								name="currentPassword"
								value={formData.currentPassword}
								onChange={handleInputChange}
								className="flex-1 input border border-gray-700 p-2 rounded input-md"
							/>
							<input
								type="password"
								placeholder="New Password"
								name="newPassword"
								value={formData.newPassword}
								onChange={handleInputChange}
								className="flex-1 input border border-gray-700 p-2 rounded input-md"
							/>
						</div>

						<input
							type="text"
							placeholder="Website or Link"
							name="link"
							value={formData.link}
							onChange={handleInputChange}
							className="input border border-gray-700 p-2 rounded input-md"
						/>

						<button
							type="submit"
							disabled={isUpdatingProfile}
							className="btn btn-primary rounded-full btn-sm text-white"
						>
							{isUpdatingProfile ? "Updating..." : "Update Profile"}
						</button>
					</form>
				</div>

				<form method="dialog" className="modal-backdrop">
					<button className="outline-none">Close</button>
				</form>
			</dialog>
		</>
	);
};

export default EditProfileModal;
