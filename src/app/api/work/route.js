import { NextResponse } from "next/server";
import mongoose from "mongoose";

if (!mongoose.connection.readyState) {
  await mongoose.connect(process.env.MONGO_URI);
}

const workSchema = new mongoose.Schema({
  subject: String,
  work: String,
  deadline: Date,
  fileUrl: String,
  addedBy: String,
  status: [
    {
      userId: String,
      username: String,
      email: String,
      state: String, // "completed" | "doing" | "not yet started"
    },
  ],
  counts: {
    completed: { type: Number, default: 0 },
    doing: { type: Number, default: 0 },
    notYetStarted: { type: Number, default: 0 },
  },
});

const Work = mongoose.models.Work || mongoose.model("Work", workSchema);

export async function POST(req, { params }) {
  try {
    const { userId, username, email, state } = await req.json();
    const { id } = params;

    if (!userId || !state) {
      return NextResponse.json(
        { success: false, message: "Missing user or state" },
        { status: 400 }
      );
    }

    const work = await Work.findById(id);
    if (!work)
      return NextResponse.json(
        { success: false, message: "Work not found" },
        { status: 404 }
      );

    // update or insert status for user
    const existing = work.status.find((s) => s.userId === userId);
    if (existing) {
      existing.state = state;
    } else {
      work.status.push({ userId, username, email, state });
    }

    // recalc counts
    const counts = { completed: 0, doing: 0, notYetStarted: 0 };
    for (const s of work.status) {
      if (s.state === "completed") counts.completed++;
      else if (s.state === "doing") counts.doing++;
      else counts.notYetStarted++;
    }
    work.counts = counts;

    await work.save();

    // get global totals
    const allWorks = await Work.find();
    const totals = {
      totalWorks: allWorks.length,
      completed: allWorks.reduce((a, w) => a + (w.counts?.completed || 0), 0),
      doing: allWorks.reduce((a, w) => a + (w.counts?.doing || 0), 0),
      notYetStarted: allWorks.reduce(
        (a, w) => a + (w.counts?.notYetStarted || 0),
        0
      ),
    };

    return NextResponse.json({ success: true, work, totals });
  } catch (err) {
    console.error("Status update error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
