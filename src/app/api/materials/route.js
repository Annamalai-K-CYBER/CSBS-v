import { NextResponse } from "next/server";
import mongoose from "mongoose";

// ✅ Connect to MongoDB
if (!mongoose.connection.readyState) {
  await mongoose.connect(process.env.MONGO_URI);
}

// ✅ Define model (same as in upload route)
const Mat =
  mongoose.models.Mat ||
  mongoose.model(
    "Mat",
    new mongoose.Schema({
      link: String,
      name: String,
      matname: String,
      subject: String,
      format: String,
      uploadDate: Date,
    })
  );

// ✅ GET — Fetch all materials
export async function GET() {
  try {
    const mats = await Mat.find().sort({ uploadDate: -1 });
    return NextResponse.json(mats);
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Fetch failed", error: err.message },
      { status: 500 }
    );
  }
}
