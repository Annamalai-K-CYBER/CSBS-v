import { NextResponse } from "next/server";
import mongoose from "mongoose";

// ✅ MongoDB Connection
if (!mongoose.connection.readyState) {
  await mongoose.connect("mongodb://localhost:27017/csbs", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ MongoDB connected (work/[id])");
}

// ✅ Schema & Model
const workSchema = new mongoose.Schema(
  {
    subject: String,
    work: String,
    deadline: String,
    addedBy: { type: String, default: "Admin" },
    fileUrl: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    status: [
      {
        userId: String,
        username: String,
        state: {
          type: String,
          enum: ["completed", "doing", "not yet started"],
          default: "not yet started",
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    counts: {
      completed: { type: Number, default: 0 },
      doing: { type: Number, default: 0 },
      notYetStarted: { type: Number, default: 0 },
    },
  },
  { collection: "works" }
);

const Work = mongoose.models.Work || mongoose.model("Work", workSchema);

// ✅ DELETE handler
export async function DELETE(req, context) {
  try {
    // 👇 Await params before destructuring (fixes the Promise issue)
    const { id } = await context.params;
    console.log("🗑️ Deleting work:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "No ID provided" },
        { status: 400 }
      );
    }

    const deleted = await Work.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Work not found" },
        { status: 404 }
      );
    }

    console.log("✅ Work deleted:", deleted._id);
    const totals = await getTotals();

    return NextResponse.json({ success: true, totals });
  } catch (err) {
    console.error("❌ Delete error:", err);
    return NextResponse.json(
      { success: false, message: "Delete failed", error: err.message },
      { status: 500 }
    );
  }
}

// ✅ Helper function
async function getTotals() {
  const all = await Work.find();
  let totalWorks = all.length;
  let completed = 0,
    doing = 0,
    notYetStarted = 0;

  all.forEach((w) => {
    completed += w.counts?.completed || 0;
    doing += w.counts?.doing || 0;
    notYetStarted += w.counts?.notYetStarted || 0;
  });

  return { totalWorks, completed, doing, notYetStarted };
}
