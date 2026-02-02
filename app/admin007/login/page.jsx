"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const loginHandler = async () => {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin007/add-question");
    } else {
      alert("Invalid admin password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#5A3EFB]">
          Admin Login
        </h1>

        <input
          type="password"
          className="w-full p-3 border rounded mb-4 focus:ring-2 focus:ring-[#5A3EFB]"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={loginHandler}
          className="w-full p-3 bg-[#5A3EFB] hover:bg-[#4a33d6] text-white rounded-xl"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
