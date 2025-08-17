// src/pages/auth/login/LoginPage.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import XSvg from "../../../components/svgs/X"; // Ensure this path is valid
import { baseUrl } from "../../../constant/url";
import toast from "react-hot-toast";
const LoginPage = () => { 
  const [formData, setFormData] = useState({ username: "", password: "" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        credentials:"include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid credentials");
      return data;
    },
    onSuccess: () => {
      toast.success("Login success")
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <XSvg className="w-3/4 fill-white" />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <XSvg className="w-10 mb-4 fill-white" />
          <h1 className="text-4xl font-bold">Log in to X</h1>
          <form onSubmit={(e) => { e.preventDefault(); loginMutation(formData); }} className="space-y-6">
            <div className="flex items-center border border-gray-600 rounded px-4 py-2 bg-gray-800">
              <MdOutlineMail className="text-xl mr-3" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="bg-transparent outline-none w-full text-white placeholder-gray-400"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center border border-gray-600 rounded px-4 py-2 bg-gray-800">
              <MdPassword className="text-xl mr-3" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="bg-transparent outline-none w-full text-white placeholder-gray-400"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>

            {isError && <p className="text-red-500 text-sm">{error.message}</p>}
          </form>

          <p className="text-center mt-4">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
