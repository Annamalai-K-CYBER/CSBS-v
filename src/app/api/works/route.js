import { NextResponse } from "next/server";
import mongoose from "mongoose";

if (!mongoose.connection.readyState) {
  await mongoose.connect("mongodb+srv://username:password@cluster0.mongodb.net/csbs");
}

const Work = mongoose.models.Work;

export async function GET() {
  try {
    const works = await Work.find().sort({ createdAt: -1 });
    const totals = await getTotals();
    return NextResponse.json({ success: true, works, totals });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Fetch failed" },
      { status: 500 }
    );
  }
}

async function getTotals() {
  const all = await mongoose.models.Work.find();
  let totalWorks = all.length;
  let completed = 0,
    doing = 0,
    notYetStarted = 0;
  all.forEach((w) => {
    completed += w.counts.completed || 0;
    doing += w.counts.doing || 0;
    notYetStarted += w.counts.notYetStarted || 0;
  });
  return { totalWorks, completed, doing, notYetStarted };
}
