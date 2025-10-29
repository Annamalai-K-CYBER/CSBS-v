"use client";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function UploadPage() {
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [file, setFile] = useState(null);
  const [materialName, setMaterialName] = useState("");
  const [subject, setSubject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [materials, setMaterials] = useState([]);

  // ✅ Fetch all materials from your Next.js API
  async function fetchMaterials() {
    try {
      const res = await fetch("/api/materials"); // no need for full localhost URL
      const data = await res.json();

      // ✅ Fix: data itself is the array (not data.data)
      setMaterials(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  }

  useEffect(() => {
    fetchMaterials();
  }, []);

  // ✅ Decode JWT (if exists in localStorage)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded?.name || "");
        setIsAdmin(decoded?.role === "admin");
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  // ✅ Input handlers
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleNameChange = (e) => setMaterialName(e.target.value);
  const handleSubjectChange = (e) => setSubject(e.target.value);

  // ✅ Upload Function
  const handleUpload = async () => {
    if (!file) return alert("Please choose a file!");
    if (!username) return alert("Login required!");
    if (!materialName) return alert("Enter a material name!");
    if (!subject) return alert("Enter a subject!");

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);
    formData.append("materialName", materialName);
    formData.append("subject", subject);
    formData.append("uploadDate", new Date().toISOString());

    try {
      // ✅ Match your backend route name (change upmat → upload)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setUploadedUrl(data.url);
        await fetchMaterials();
      } else {
        alert(data.message || "Upload failed!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-[90%] max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Study Materials 📚</h1>

        <p className="mb-4 text-gray-600">
          {username ? `Welcome, ${username} 👋` : "Please log in first."}
        </p>

        {isAdmin ? (
          <>
            <input
              type="text"
              placeholder="Enter material name"
              value={materialName}
              onChange={handleNameChange}
              className="block w-full mb-4 border border-gray-300 rounded-lg p-2"
            />

            <input
              type="text"
              placeholder="Enter subject"
              value={subject}
              onChange={handleSubjectChange}
              className="block w-full mb-4 border border-gray-300 rounded-lg p-2"
            />

            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full mb-4 border border-gray-300 rounded-lg p-2"
            />

            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`px-6 py-2 rounded-lg text-white font-semibold w-full ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Material"}
            </button>

            {uploadedUrl && (
              <div className="mt-6">
                <p className="text-gray-700 mb-2">✅ Uploaded Successfully:</p>
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {uploadedUrl}
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-700 mb-4">
            You can view available materials below.
          </p>
        )}
      </div>

      {/* ✅ Material cards */}
      <div className="mt-10 w-[90%] max-w-4xl bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold text-blue-600 mb-6">
          Available Materials
        </h2>

        {materials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((mat, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-gray-50 hover:bg-white"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {mat.matname}
                </h3>

                <p className="text-sm text-blue-600 font-medium mb-2">
                  Subject: {mat.subject || "N/A"}
                </p>

                <p className="text-xs text-gray-500 mb-2">
                  Uploaded on:{" "}
                  {mat.uploadDate
                    ? new Date(mat.uploadDate).toLocaleDateString()
                    : "N/A"}
                </p>

                <img
                  src={
                    ["png", "jpg", "jpeg", "img"].includes(
                      mat.format?.toLowerCase()
                    )
                      ? "https://img.icons8.com/arcade/128/image.png"
                      : "https://img.icons8.com/arcade/128/document.png"
                  }
                  alt={mat.matname || "material"}
                  width="64"
                  height="64"
                  className="rounded-lg object-cover mx-auto mb-3"
                />

                <p className="text-sm text-gray-500 mb-3">
                  Uploaded by: {mat.name || "Unknown"}
                </p>

                {mat.link ? (
                  <a
                    href={mat.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    View / Download
                  </a>
                ) : (
                  <p className="text-gray-400 text-sm">No link available</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No materials available yet.</p>
        )}
      </div>
    </div>
  );
}
