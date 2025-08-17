// src/components/common/Posts.js
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { baseUrl } from "../../constant/url";

const Posts = ({ feedType, username, userId }) => {
	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return `${baseUrl}/api/posts/all`;
			case "following":
				return `${baseUrl}/api/posts/following`;
			case "posts":
				return `${baseUrl}/api/posts/user/${username}`;
			case "likes":
				return `${baseUrl}/api/posts/likes/${userId}`;
			default:
				return `${baseUrl}/api/posts/all`;
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["posts", feedType, username],
		queryFn: async () => {
			const res = await fetch(POST_ENDPOINT, {
				credentials: "include",
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to fetch posts");
			}
			return data;
		},
	});

	useEffect(() => {
		refetch();
	}, [feedType, username, refetch]);

	return (
		<div className="p-4 bg-black min-h-screen text-white">
			{(isLoading || isRefetching) && (
				<div className="flex flex-col gap-4">
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}

			{!isLoading && !isRefetching && posts?.length === 0 && (
				<p className="text-center text-gray-400 mt-4">
					No posts in this tab. Switch 👻
				</p>
			)}

			{!isLoading && !isRefetching && posts && (
				<div className="flex flex-col gap-4">
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</div>
	);
};

export default Posts;
