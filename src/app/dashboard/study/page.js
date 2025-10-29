"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function StudyPage() {
  const [portions, setPortions] = useState([]);
  const [open, setOpen] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const subjectStaffMap = {
    Math: "Mr. Kumar",
    Physics: "Ms. Priya",
    Chemistry: "Dr. Sanjay",
    "Computer Science": "Mrs. Lakshmi",
    English: "Mr. Rajesh",
  };

  const subjectsList = Object.keys(subjectStaffMap);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/portions");
        const json = await res.json();
        if (json.success) setPortions(json.data);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") setIsAdmin(true);
      } catch {
        console.error("Invalid token");
      }
    }

    fetchData();
  }, []);

  const toggleDropdown = (index) => setOpen(open === index ? null : index);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!subject || !topic) return alert("Please select subject & enter topic.");

    const staff = subjectStaffMap[subject];
    try {
      const res = await fetch("/api/portions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          topic: topic.trim(),
          staff,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Topic added successfully by ${staff}!`);
        setTopic("");
        const updated = await fetch("/api/portions").then((r) => r.json());
        if (updated.success) setPortions(updated.data);
      } else alert("❌ " + (data.message || "Failed to add topic."));
    } catch (err) {
      console.error("❌ POST error:", err);
      alert("Something went wrong while adding the topic.");
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timetable = [
    ["Math", "Physics", "Chemistry", "CS", "English", "Math", "Physics"],
    ["Physics", "Math", "English", "CS", "Chemistry", "English", "Math"],
    ["Chemistry", "CS", "Math", "Physics", "English", "Math", "CS"],
    ["Math", "English", "Physics", "Chemistry", "CS", "English", "Math"],
    ["CS", "Math", "Chemistry", "Physics", "English", "Math", "CS"],
    ["English", "Physics", "Math", "Chemistry", "CS", "Math", "English"],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100 p-8 md:p-12">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-indigo-800 tracking-tight drop-shadow-sm">
        📚 Study Progress Dashboard
      </h2>

      {/* Admin Form */}
      {isAdmin && (
        <form
          onSubmit={handleAddTopic}
          className="bg-white/80 backdrop-blur-md border border-indigo-100 shadow-lg p-6 rounded-2xl mb-12 max-w-xl mx-auto hover:shadow-2xl transition"
        >
          <h3 className="text-2xl font-semibold text-indigo-700 mb-5 text-center">
            🧑‍🏫 Add Completed Topic
          </h3>
          <div className="flex flex-col gap-4">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="p-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Subject</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {subject && (
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-center font-medium">
                👨‍🏫 Staff: <b>{subjectStaffMap[subject]}</b>
              </div>
            )}

            <input
              type="text"
              placeholder="Enter topic name"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="p-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400"
            />

            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition transform"
            >
              ➕ Add Topic
            </button>
          </div>
        </form>
      )}

      {/* Subject Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {portions.map((item, i) => (
          <div
            key={i}
            className="group bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-md rounded-3xl shadow-lg border border-indigo-100 p-6 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1"
          >
            <div
              onClick={() => toggleDropdown(i)}
              className="flex justify-between items-center cursor-pointer"
            >
              <div>
                <h3 className="text-2xl font-bold text-indigo-700 group-hover:text-indigo-800 transition">
                  {item.subject}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  👨‍🏫 {item.staff || subjectStaffMap[item.subject]}
                </p>
              </div>
              {open === i ? (
                <ChevronUp className="text-indigo-600 w-6 h-6" />
              ) : (
                <ChevronDown className="text-indigo-600 w-6 h-6" />
              )}
            </div>

            {open === i && (
              <div className="mt-5 border-t border-indigo-100 pt-3">
                <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100">
                  {item.completedTopics?.length > 0 ? (
                    item.completedTopics.map((t, idx) => (
                      <div
                        key={idx}
                        className="bg-indigo-50 border border-indigo-100 rounded-lg py-2 px-3 text-gray-700 hover:bg-indigo-100 transition flex items-center gap-2"
                      >
                        <span>✅</span>
                        <span>{t}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-center py-3">
                      No topics completed yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timetable */}
      <div className="bg-white/90 shadow-xl rounded-2xl border border-indigo-100 overflow-x-auto">
        <h3 className="text-2xl font-bold text-indigo-700 text-center py-4 border-b border-indigo-100">
          🗓️ Weekly Timetable
        </h3>
        <table className="min-w-full text-center border-collapse">
          <thead className="bg-indigo-100 text-indigo-800">
            <tr>
              <th className="p-3 border border-indigo-100">Day</th>
              {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                <th key={p} className="p-3 border border-indigo-100">
                  Period {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, i) => (
              <tr key={i} className="hover:bg-indigo-50 transition">
                <td className="p-3 font-semibold border border-indigo-100 bg-indigo-50">
                  {day}
                </td>
                {timetable[i].map((subj, j) => (
                  <td key={j} className="p-3 border border-indigo-100 text-gray-700">
                    {subj}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-rose-100">
              <td className="p-3 font-semibold border border-indigo-100">Sunday</td>
              <td
                colSpan={7}
                className="p-3 border border-indigo-100 text-gray-600 italic"
              >
                🌞 Holiday
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
