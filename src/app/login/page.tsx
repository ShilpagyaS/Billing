"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid username or password.");
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Arial, sans-serif", padding: "24px",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(200,169,81,0.3)",
        borderRadius: "18px",
        padding: "40px 36px",
        width: "100%", maxWidth: "380px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Logo + title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            overflow: "hidden", border: "2.5px solid #c8a951",
            margin: "0 auto 14px",
            boxShadow: "0 0 20px rgba(200,169,81,0.35)",
            background: "#fff",
          }}>
            <Image src="/rgtl-logo.jpg" alt="RGTL" width={80} height={80}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ color: "#e8c97a", fontSize: "20px", fontWeight: 900, letterSpacing: "1px", margin: 0 }}>
            RAJA GEMS
          </h1>
          <p style={{ color: "#8899bb", fontSize: "11px", letterSpacing: "2px", margin: "4px 0 0" }}>
            TESTING LAB · ADMIN
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", color: "#8899bb", fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Enter username"
              autoComplete="username"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(200,169,81,0.25)",
                borderRadius: "9px", padding: "11px 14px",
                color: "#e8e8f0", fontSize: "14px", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#c8a951"}
              onBlur={e  => e.target.style.borderColor = "rgba(200,169,81,0.25)"}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#8899bb", fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Enter password"
                autoComplete="current-password"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(200,169,81,0.25)",
                  borderRadius: "9px", padding: "11px 40px 11px 14px",
                  color: "#e8e8f0", fontSize: "14px", outline: "none",
                }}
                onFocus={e => e.target.style.borderColor = "#c8a951"}
                onBlur={e  => e.target.style.borderColor = "rgba(200,169,81,0.25)"}
              />
              <button onClick={() => setShowPass(p => !p)} style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "#8899bb", fontSize: "15px", padding: 0,
              }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(220,50,50,0.12)",
              border: "1px solid rgba(220,50,50,0.35)",
              borderRadius: "8px", padding: "9px 14px",
              color: "#ff8888", fontSize: "13px", textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              marginTop: "6px",
              width: "100%",
              background: loading ? "rgba(200,169,81,0.5)" : "linear-gradient(135deg, #c8a951, #e8c97a)",
              color: "#1a1a2e", fontWeight: 800, fontSize: "14px",
              letterSpacing: "1px", padding: "13px",
              borderRadius: "10px", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              textTransform: "uppercase",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p style={{ textAlign: "center", color: "#334455", fontSize: "11px", marginTop: "24px" }}>
          Raja Gems Testing Lab · Jabalpur (M.P.)
        </p>
      </div>
    </div>
  );
}
