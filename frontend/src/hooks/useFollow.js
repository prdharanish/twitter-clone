import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../constant/url";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isLoading } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${baseUrl}/api/users/follow/${userId}`, {
        method: "POST",
        credentials: "include", // ✅ send cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong!");
      return data;
    },
    onSuccess: () => {
      toast.success("Follow/unfollow successful");
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { follow, isLoading };
};

export default useFollow;
