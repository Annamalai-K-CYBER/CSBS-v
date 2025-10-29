"use client";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const API_BASE = "http://localhost:3000";

export default function WorkPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [works, setWorks] = useState([]);
  const [totals, setTotals] = useState({
    totalWorks: 0,
    completed: 0,
    doing: 0,
    notYetStarted: 0,
  });

  const [subject, setSubject] = useState("");
  const [workText, setWorkText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Decode JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setIsAdmin(decoded?.role === "admin");
      setUsername(decoded?.name || decoded?.username || "");
      setEmail(decoded?.email || "");
      setUserId(decoded?.userId || decoded?._id || "");
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
    }
  }, []);

  // ✅ Fetch all works
  const fetchWorks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/works`);
      const data = await res.json();
      if (data.success) {
        setWorks(data.works || []);
        setTotals(data.totals || data.counts || {});
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  // ✅ Upload file to server
  const uploadFile = async () => {
    if (!file) return "";
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/work`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data?.fileUrl || "";
    } catch (err) {
      console.error("Upload failed:", err);
      alert("File upload failed");
      return "";
    } finally {
      setUploading(false);
    }
  };

  // ✅ Add new work (admin)
  const handleAddWork = async () => {
    if (!subject || !workText || !deadline) {
      alert("Please fill all fields");
      return;
    }
    const fileUrl = file ? await uploadFile() : "";
    try {
      const res = await fetch(`${API_BASE}/api/work/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          work: workText,
          deadline,
          fileUrl,
          addedBy: username,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWorks([data.work, ...works]);
        setTotals(data.totals);
        setSubject("");
        setWorkText("");
        setDeadline("");
        setFile(null);
      } else {
        alert(data.message || "Error adding work");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Update status
  const handleStatusChange = async (workId, state) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    try {
      const res = await fetch(`${API_BASE}/api/work/status/${workId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, username, email, state }),
      });
      const data = await res.json();
      if (data.success) {
        setWorks((prev) =>
          prev.map((w) => (w._id === data.work._id ? data.work : w))
        );
        setTotals(data.totals);
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("❌ Update error:", err);
    }
  };

  // ✅ Delete work
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this work?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/work/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setWorks((prev) => prev.filter((w) => w._id !== id));
        setTotals(data.totals);
      } else {
        alert("Failed to delete work");
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  // ✅ UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f9ff] to-[#f8fafc] flex flex-col items-center py-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 w-[90%] max-w-6xl">
        {[
          { label: "Total Works", value: totals.totalWorks, color: "from-indigo-500 to-indigo-700", icon: "📚" },
          { label: "Completed", value: totals.completed, color: "from-green-400 to-green-600", icon: "✅" },
          { label: "Doing", value: totals.doing, color: "from-amber-400 to-amber-600", icon: "⚙️" },
          { label: "Not Yet Started", value: totals.notYetStarted, color: "from-rose-400 to-red-600", icon: "🕒" },
        ].map((card, i) => (
          <div
            key={i}
            className={`bg-gradient-to-r ${card.color} rounded-2xl text-white shadow-md p-6 text-center transform hover:scale-105 transition-all`}
          >
            <div className="text-4xl">{card.icon}</div>
            <div className="text-sm uppercase tracking-wide mt-1">{card.label}</div>
            <div className="text-3xl font-bold mt-2">{card.value ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Add Work (Admin) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-3xl mb-10 border border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-700 mb-5 flex items-center gap-2">➕ Add New Work</h2>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="block w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />
          <textarea
            placeholder="Work / Assignment details"
            value={workText}
            onChange={(e) => setWorkText(e.target.value)}
            className="block w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="block w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full mb-3"
          />
          <button
            onClick={handleAddWork}
            disabled={uploading}
            className={`w-full py-2 rounded-lg font-semibold text-white ${
              uploading
                ? "bg-gray-400"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
            }`}
          >
            {uploading ? "Uploading..." : "Add Work"}
          </button>
        </div>
      )}

      {/* Works List */}
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-6xl p-8 border border-indigo-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-indigo-700">📘 Current Works</h3>
          <button onClick={fetchWorks} className="text-indigo-600 text-sm hover:underline">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : works.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No works found</div>
        ) : (
          <div className="grid gap-5">
            {works.map((w) => {
              const myStatus =
                (w.status || []).find((s) => s.userId === userId)?.state ||
                "not yet started";

              return (
                <div
                  key={w._id}
                  className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-indigo-50 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-indigo-800">{w.subject}</h4>
                      <p className="text-gray-600 mt-1">{w.work}</p>
                      <p className="text-gray-600 mt-1">
                        <b>Deadline:</b> {w.deadline ? new Date(w.deadline).toLocaleDateString() : "—"}
                      </p>
                      {w.fileUrl && (
                        <a
                          href={w.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline mt-2 block"
                        >
                          📎 View File
                        </a>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Added by: {w.addedBy || "Admin"}</p>
                    </div>

                    <div className="text-right text-sm font-medium">
                      <p>✅ {w.counts?.completed ?? 0}</p>
                      <p>⚙️ {w.counts?.doing ?? 0}</p>
                      <p>🕒 {w.counts?.notYetStarted ?? 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => handleStatusChange(w._id, "completed")}
                      className={`px-3 py-1 rounded-lg text-white ${
                        myStatus === "completed"
                          ? "bg-green-700"
                          : "bg-green-500 hover:opacity-90"
                      }`}
                    >
                      ✅ Completed
                    </button>
                    <button
                      onClick={() => handleStatusChange(w._id, "doing")}
                      className={`px-3 py-1 rounded-lg text-white ${
                        myStatus === "doing"
                          ? "bg-yellow-600"
                          : "bg-yellow-500 hover:opacity-90"
                      }`}
                    >
                      ⚙️ Doing
                    </button>
                    <button
                      onClick={() => handleStatusChange(w._id, "not yet started")}
                      className={`px-3 py-1 rounded-lg text-white ${
                        myStatus === "not yet started"
                          ? "bg-gray-700"
                          : "bg-gray-500 hover:opacity-90"
                      }`}
                    >
                      🕒 Not Yet Started
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(w._id)}
                        className="ml-auto bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
