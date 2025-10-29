import { NextResponse } from "next/server";
import mongoose from "mongoose";

// ✅ Connect to MongoDB (once)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/csbs", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB (csbs)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

// ✅ User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: { type: String, default: "user" },
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

// ✅ Work schema
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
      state: String,
    },
  ],
  counts: {
    completed: { type: Number, default: 0 },
    doing: { type: Number, default: 0 },
    notYetStarted: { type: Number, default: 0 },
  },
});

const Work = mongoose.models.Work || mongoose.model("Work", workSchema);

// ✅ POST (Add new work)
export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { subject, work, deadline, fileUrl, addedBy } = body;

    if (!subject || !work || !deadline || !addedBy) {
      return NextResponse.json(
        { success: false, message: "❌ Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Fetch all users (optional)
    const users = await User.find();

    // ✅ Initialize each user status
    const initialStatus = users.map((u) => ({
      userId: u._id.toString(),
      username: u.username,
      email: u.email,
      state: "notYetStarted",
    }));

    const newWork = new Work({
      subject,
      work,
      deadline,
      fileUrl,
      addedBy,
      status: initialStatus,
      counts: {
        completed: 0,
        doing: 0,
        notYetStarted: initialStatus.length,
      },
    });

    await newWork.save();

    // ✅ Compute global totals
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

    return NextResponse.json({ success: true, work: newWork, totals });
  } catch (err) {
    console.error("❌ Work add error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
