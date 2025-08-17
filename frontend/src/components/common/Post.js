import { useState } from "react";
import { Link } from "react-router-dom";
import {
	FaRegComment,
	FaRegHeart,
	FaHeart,
	FaTrash,
	FaRegBookmark,
} from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { baseUrl } from "../../constant/url";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const queryClient = useQueryClient();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const postOwner = post.user;
	const isMyPost = authUser?._id === postOwner?._id;
	const isLiked = post.likes.includes(authUser?._id);
	const formattedDate = formatPostDate(post.createdAt);

	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${baseUrl}/api/posts/delete/${post._id}`, {
				method: "DELETE",
				credentials: "include",
			});
			if (!res.ok) throw new Error(await res.text());
		},
		onSuccess: () => {
			toast.success("Post deleted");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (err) => toast.error(err.message),
	});

	const { mutate: toggleLike, isPending: isLiking } = useMutation({
  mutationFn: async () => {
    const res = await fetch(`${baseUrl}/api/posts/like/${post._id}`, {
      method: "PUT", // use PUT since you're toggling like state
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // this should be updated likes array
  },
  onSuccess: () => {
    // Safer approach: refetch posts to update UI
    queryClient.invalidateQueries(["posts"]);
  },
  onError: (err) => toast.error(err.message),
});


	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${baseUrl}/api/posts/comment/${post._id}`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: comment }),
			});
			if (!res.ok) throw new Error(await res.text());
			return res.json();
		},
		onSuccess: () => {
			setComment("");
			toast.success("Comment added");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<div className='bg-white text-black flex gap-2 items-start p-4 border-b border-gray-300'>
			<div className='avatar'>
				<Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden block'>
					<img
						src={postOwner.profileImg || "/avatar-placeholder.png"}
						alt={`${postOwner.username}'s avatar`}
					/>
				</Link>
			</div>

			<div className='flex flex-col flex-1'>
				<div className='flex gap-2 items-center'>
					<Link to={`/profile/${postOwner.username}`} className='font-bold text-black'>
						{postOwner.fullName}
					</Link>
					<span className='text-black flex gap-1 text-sm'>
						<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
						<span>·</span>
						<span>{formattedDate}</span>
					</span>
					{isMyPost && (
						<span className='flex justify-end flex-1'>
							{!isDeleting ? (
								<FaTrash className='cursor-pointer hover:text-red-500' onClick={deletePost} />
							) : (
								<LoadingSpinner size='sm' />
							)}
						</span>
					)}
				</div>

				<div className='flex flex-col gap-3 mt-2'>
					<span>{post.text}</span>
					{post.img && (
						<img
							src={post.img}
							alt='Post'
							className='h-80 object-contain rounded-lg border border-gray-300'
						/>
					)}
				</div>

				<div className='flex justify-between mt-3'>
					<div className='flex gap-4 items-center w-2/3 justify-between'>
						<div
							className='flex gap-1 items-center cursor-pointer group'
							onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
						>
							<FaRegComment className='w-4 h-4 text-gray-600 group-hover:text-blue-500' />
							<span className='text-sm text-gray-600 group-hover:text-blue-500'>
								{post.comments.length}
							</span>
						</div>

						<dialog id={`comments_modal${post._id}`} className='modal'>
							<div className='modal-box bg-black text-white rounded border border-gray-600'>
								<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
								<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
									{post.comments.length === 0 ? (
										<p className='text-sm text-gray-400'>
											No comments yet 🤔 Be the first one 😉
										</p>
									) : (
										post.comments.map((c) => (
											<div key={c._id} className='flex gap-2 items-start'>
												<div className='avatar w-8 rounded-full overflow-hidden'>
													<img src={c.user.profileImg || "/avatar-placeholder.png"} alt='' />
												</div>
												<div className='flex flex-col'>
													<div className='flex gap-1 items-center'>
														<span className='font-bold text-white'>{c.user.fullName}</span>
														<span className='text-sm text-gray-400'>@{c.user.username}</span>
													</div>
													<p className='text-sm'>{c.text}</p>
												</div>
											</div>
										))
									)}
								</div>

								<form
									onSubmit={(e) => {
										e.preventDefault();
										if (!comment.trim()) return;
										commentPost();
									}}
									className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
								>
									<textarea
										value={comment}
										onChange={(e) => setComment(e.target.value)}
										placeholder='Add a comment...'
										className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800 text-black'
									/>
									<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
										{isCommenting ? <LoadingSpinner size='md' /> : "Post"}
									</button>
								</form>
							</div>
							<form method='dialog' className='modal-backdrop'>
								<button className='outline-none'>close</button>
							</form>
						</dialog>

						<div className='flex gap-1 items-center cursor-pointer group'>
							<BiRepost className='w-6 h-6 text-gray-600 group-hover:text-green-500' />
							<span className='text-sm text-gray-600 group-hover:text-green-500'>0</span>
						</div>

						<div className='flex gap-1 items-center group cursor-pointer' onClick={() => !isLiking && toggleLike()}>
							{isLiking ? (
								<LoadingSpinner size='sm' />
							) : isLiked ? (
								<FaHeart className='w-4 h-4 text-pink-500' />
							) : (
								<FaRegHeart className='w-4 h-4 text-gray-600 group-hover:text-pink-500' />
							)}
							<span className={`text-sm ${isLiked ? "text-pink-500" : "text-gray-600"} group-hover:text-pink-500`}>
								{post.likes.length}
							</span>
						</div>
					</div>

					<div className='flex w-1/3 justify-end gap-2 items-center'>
						<FaRegBookmark className='w-4 h-4 text-gray-600 cursor-pointer' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Post;
