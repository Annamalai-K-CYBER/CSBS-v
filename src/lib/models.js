import mongoose from "mongoose";

// ✅ Connect to MongoDB once
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/csbs")
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err));
}

// 🧑‍💻 USER MODEL
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
  },
  { collection: "users" }
);

// 📘 MATERIAL MODEL (with uploadedBy as string)
const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    link: { type: String, required: true },
    type: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
  },
  { collection: "mats" }
);

// ✅ Subschema: Per-user status
const workStatusSubSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: { type: String, required: true },
    state: {
      type: String,
      enum: ["completed", "doing", "not yet started"],
      default: "not yet started",
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ✅ Subschema: Counts summary
const workCountsSubSchema = new mongoose.Schema(
  {
    completed: { type: Number, default: 0 },
    doing: { type: Number, default: 0 },
    notYetStarted: { type: Number, default: 0 },
  },
  { _id: false }
);

// ✅ Main Work schema
const workSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  work: { type: String, required: true },
  deadline: { type: String, required: true },
  addedBy: { type: String, default: "Admin" },
  fileUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },

  // 🧩 Array of user progress
  status: { type: [workStatusSubSchema], default: [] },

  // 📊 Aggregated counts
  counts: { type: workCountsSubSchema, default: () => ({}) },
});

// 🧩 Portion Schema (NEW)
const portionSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    staff: { type: String, required: true },
    completedTopics: [{ type: String }],
  },
  { collection: "portions" }
);

// ✅ Prevent model overwrite errors in Next.js
export const Work = mongoose.models.Work || mongoose.model("Work", workSchema);
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Material =
  mongoose.models.Material || mongoose.model("Material", materialSchema);
export const Portion =
  mongoose.models.Portion || mongoose.model("Portion", portionSchema);
