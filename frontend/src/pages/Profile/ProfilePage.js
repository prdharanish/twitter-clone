import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft, FaLink } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import { formatMemberSinceDate } from "../../utils/date";
import { baseUrl } from "../../constant/url";

const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");

	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);

	const { username } = useParams();
	const { follow, isPending } = useFollow();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const {
		data: user,
		isLoading,
		isError,
		error,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["userProfile", username],
		queryFn: async () => {
			const res = await fetch(`${baseUrl}/api/users/profile/${username}`, {
				credentials: "include",
			});
			const text = await res.text();
			let data;

			try {
				data = JSON.parse(text);
			} catch (err) {
				throw new Error("Invalid JSON response: " + text);
			}

			if (!res.ok || data.error) {
				throw new Error(data.error || "Something went wrong");
			}
			return data;
		},
		enabled: !!username,
	});

	const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

	const isMyProfile = authUser?._id === user?._id;
	const memberSinceDate = formatMemberSinceDate(user?.createdAt);
	const amIFollowing = authUser?.following.includes(user?._id);

	const handleImgChange = (e, type) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				type === "coverImg" && setCoverImg(reader.result);
				type === "profileImg" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	useEffect(() => {
		refetch();
	}, [username, refetch]);

	return (
		<div className='flex-[4_4_0] border-r border-gray-700 min-h-screen bg-white text-black'>
			{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
			{!isLoading && !isRefetching && isError && (
				<p className='text-center text-red-500 text-lg mt-4'>
					{error.message || "User not found"}
				</p>
			)}

			{!isLoading && !isRefetching && user && (
				<>
					{/* Header */}
					<div className='flex gap-10 px-4 py-2 items-center'>
						<Link to='/'>
							<FaArrowLeft className='w-4 h-4' />
						</Link>
						<div className='flex flex-col'>
							<p className='font-bold text-lg'>{user.fullName}</p>
							<span className='text-sm text-gray-500'>
								{user.posts?.length ?? 0} posts
							</span>
						</div>
					</div>

					{/* Cover Image */}
					<div className='relative group/cover'>
						<img
							src={coverImg || user.coverImg || "/cover.png"}
							className='h-52 w-full object-cover'
							alt='Cover'
						/>
						{isMyProfile && (
							<div
								onClick={() => coverImgRef.current.click()}
								className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
							>
								<MdEdit className='w-5 h-5 text-white' />
							</div>
						)}
						<input
							type='file'
							hidden
							accept='image/*'
							ref={coverImgRef}
							onChange={(e) => handleImgChange(e, "coverImg")}
						/>
						<input
							type='file'
							hidden
							accept='image/*'
							ref={profileImgRef}
							onChange={(e) => handleImgChange(e, "profileImg")}
						/>

						{/* Avatar */}
						<div className='avatar absolute -bottom-16 left-4'>
							<div className='w-32 rounded-full relative group/avatar'>
								<img
									src={profileImg || user.profileImg || "/avatar-placeholder.png"}
									alt='Profile'
								/>
								{isMyProfile && (
									<div
										onClick={() => profileImgRef.current.click()}
										className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'
									>
										<MdEdit className='w-4 h-4 text-white' />
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Follow / Update */}
					<div className='flex justify-end px-4 mt-5'>
						{isMyProfile && <EditProfileModal authUser={authUser} />}
						{!isMyProfile && (
							<button
								className='btn btn-outline rounded-full btn-sm'
								onClick={() => follow(user._id)}
							>
								{isPending ? "Loading..." : amIFollowing ? "Unfollow" : "Follow"}
							</button>
						)}
						{(coverImg || profileImg) && (
							<button
								className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
								onClick={async () => {
									await updateProfile({ coverImg, profileImg });
									setCoverImg(null);
									setProfileImg(null);
								}}
							>
								{isUpdatingProfile ? "Updating..." : "Update"}
							</button>
						)}
					</div>

					{/* Bio */}
					<div className='flex flex-col gap-4 mt-14 px-4'>
						<div className='flex flex-col'>
							<span className='font-bold text-lg'>{user.fullName}</span>
							<span className='text-sm text-gray-500'>@{user.username}</span>
							<span className='text-sm my-1'>{user.bio}</span>
						</div>

						{/* Link & Joined */}
						<div className='flex gap-2 flex-wrap'>
							{user.link && (
								<div className='flex gap-1 items-center'>
									<FaLink className='w-3 h-3 text-gray-500' />
									<a
										href={user.link}
										target='_blank'
										rel='noreferrer'
										className='text-sm text-blue-500 hover:underline'
									>
										{user.link}
									</a>
								</div>
							)}
							<div className='flex gap-2 items-center'>
								<IoCalendarOutline className='w-4 h-4 text-gray-500' />
								<span className='text-sm text-gray-500'>{memberSinceDate}</span>
							</div>
						</div>

						{/* Follows */}
						<div className='flex gap-2'>
							<div className='flex gap-1 items-center'>
								<span className='font-bold text-xs'>{user.following.length}</span>
								<span className='text-gray-500 text-xs'>Following</span>
							</div>
							<div className='flex gap-1 items-center'>
								<span className='font-bold text-xs'>{user.followers.length}</span>
								<span className='text-gray-500 text-xs'>Followers</span>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<div className='flex w-full border-b border-gray-300 mt-4'>
						<div
							onClick={() => setFeedType("posts")}
							className={`flex justify-center flex-1 p-3 transition duration-300 relative cursor-pointer ${feedType === "posts" ? "text-black font-bold" : "text-gray-500 hover:bg-gray-100"}`}
						>
							Posts
							{feedType === "posts" && (
								<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
							)}
						</div>
						<div
							onClick={() => setFeedType("likes")}
							className={`flex justify-center flex-1 p-3 transition duration-300 relative cursor-pointer ${feedType === "likes" ? "text-black font-bold" : "text-gray-500 hover:bg-gray-100"}`}
						>
							Likes
							{feedType === "likes" && (
								<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
							)}
						</div>
					</div>

					{/* Posts Feed */}
					<Posts feedType={feedType} username={username} userId={user._id} />
				</>
			)}
		</div>
	);
};

export default ProfilePage;
