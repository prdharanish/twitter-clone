import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { MdOutlineMail, MdPassword, MdDriveFileRenameOutline } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import XSvg from "../../../components/svgs/X"; // Make sure this path is correct
import { baseUrl } from "../../../constant/url";
const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async ({ email, username, fullName, password }) => {
      const res = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        credentials:"include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, fullName, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Account created! Redirect to login.");
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign Up Form Submitted:", formData); // ✅ Console message
    mutate(formData);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <XSvg className="w-3/4 fill-white" />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <XSvg className="w-10 mb-4 fill-white" />
          <h1 className="text-4xl font-bold">Create your account</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="input-group">
              <MdOutlineMail className="text-xl mr-3" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input text-black"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FaUser className="text-xl mr-3" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="input text-black"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <MdDriveFileRenameOutline className="text-xl mr-3" />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="input text-black"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <MdPassword className="text-xl mr-3" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="input text-black"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-2 rounded-full"
            >
              {isPending ? "Creating..." : "Sign Up"}
            </button>

            {isError && <p className="text-red-500 text-sm">{error.message}</p>}
          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
