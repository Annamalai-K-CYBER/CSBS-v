"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      setUser(decoded);
    } catch (err) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navItems = [
    { name: "Home", href: "/dashboard" },
    { name: "Study", href: "/dashboard/study" },
    { name: "Material", href: "/dashboard/material" },
    { name: "Work", href: "/dashboard/work" },
    { name: "Announcement", href: "/dashboard/announcement" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-10 py-4 bg-white/70 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-200">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CSBS Portal
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`font-medium ${
                pathname === item.href
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-purple-600"
              } transition-all`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center space-x-4">
          <p className="text-sm text-gray-600">By Students, For Students 💡</p>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-md shadow-lg flex flex-col items-center space-y-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`font-medium ${
                pathname === item.href
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-purple-600"
              } transition-all`}
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-6 md:p-10 border border-gray-100">
          <div className="text-gray-600 text-sm mb-4">
            Logged in as: <span className="font-semibold">{user?.name}</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
