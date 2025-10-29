export default function DashboardHome() {
  return (
    <div className="text-center py-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-3">
        Welcome to the CSBS Portal 🎓
      </h1>
      <p className="text-gray-700 max-w-2xl mx-auto mb-6">
        Your one-stop destination for study resources, assignments, and work
        updates. Stay connected and grow together.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {[
          { title: "Study", color: "from-blue-500 to-cyan-400" },
          { title: "Material", color: "from-purple-500 to-pink-400" },
          { title: "Work", color: "from-green-500 to-teal-400" },
          { title: "Assignment", color: "from-orange-500 to-yellow-400" },
        ].map((item) => (
          <div
            key={item.title}
            className={`p-6 rounded-2xl shadow-md text-white font-semibold bg-gradient-to-r ${item.color} hover:scale-105 transition-transform`}
          >
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
}
