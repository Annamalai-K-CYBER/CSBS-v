"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://csbs-v-h6kl.vercel.app/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Ensure backend returned valid JSON
      const data = await res.json().catch(() => null);
      console.log(data);

      if (!res.ok) {
        setError(data?.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError("No token received from server");
      }
    } catch (err) {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 text-white px-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
        <h1 className="text-4xl font-extrabold text-center mb-2">CSBS Hub</h1>
        <p className="text-center text-white/80 mb-8">
          A place for students, by students 💻
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {error && (
            <p className="text-red-300 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <footer className="mt-8 text-center text-xs text-white/60">
          © {new Date().getFullYear()} CSBS Hub | Built with ❤️ by Students
        </footer>
      </div>
    </div>
  );
}
