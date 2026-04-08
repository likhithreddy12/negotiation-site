"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = "professor123";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  // 🔹 If already logged in → skip login page
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuth = localStorage.getItem("admin_auth") === "true";
    if (isAuth) {
      router.replace("/admin");
    }
  }, [router]);

  function handleLogin() {
    if (password.trim() === ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", "true");
      router.push("/admin");
      return;
    }

    alert("Incorrect password");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "black",
        color: "white",
      }}
    >
      <div
        style={{
          border: "1px solid #333",
          padding: 30,
          borderRadius: 12,
          width: 320,
          background: "#111",
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Admin Access</h2>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin(); // 🔹 Enter key support
          }}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 16,
            borderRadius: 6,
            border: "1px solid #444",
            background: "#000",
            color: "white",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 10,
            background: "#2563eb",
            border: "none",
            borderRadius: 6,
            color: "white",
            cursor: "pointer",
          }}
        >
          Enter
        </button>
      </div>
    </main>
  );
}