import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../constant/url";

const useAuthUser = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          method: "GET",
          credentials: "include", // ensures cookies are sent
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (!res.ok || data.error) return null; // return null if not logged in
        return data;
      } catch (err) {
        console.error("Auth fetch failed:", err);
        return null;
      }
    },
    retry: false, // don’t retry automatically
  });
};

export default useAuthUser;
