import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ImageKit from "imagekit";

// ✅ MongoDB connection URI (local)
const MONGODB_URI ="mongodb+srv://username:password@cluster0.mongodb.net/csbs";

// ✅ Connect to MongoDB (only once)
if (!mongoose.connection.readyState) {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "csbs",
      bufferCommands: false,
    });
    console.log("✅ MongoDB Connected:", MONGODB_URI);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

// ✅ Define model
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

// ✅ Configure ImageKit
const imagekit = new ImageKit({
  publicKey: "public_6R62BoMlcLfGjZtdtvBbP5orhTE=",
  privateKey: "private_hlyqX79LuR238CXIE7bCNoXsF+g=",
  urlEndpoint: "https://ik.imagekit.io/9t9wl5ryo",
  uploadEndpoint: "https://upload.imagekit.io/api/v1/files/upload",
});

// ✅ POST /api/upload
export async function POST(req) {
  try {
    console.log("📥 Upload endpoint hit");

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file)
      return NextResponse.json({ success: false, message: "No file uploaded" });

    const username = formData.get("username") || "Anonymous";
    const matname = formData.get("materialName") || file.name;
    const subject = formData.get("subject") || "General";
    const ext = file.name.split(".").pop().toLowerCase();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("🧾 Uploading:", file.name);

    // ✅ Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: "/csbs_uploads",
      tags: ["csbs", ext],
    });

    console.log("✅ Uploaded to ImageKit:", uploadResponse.url);

    // ✅ Save metadata to MongoDB
    const newMat = await Mat.create({
      link: uploadResponse.url,
      name: username,
      matname,
      subject,
      format: ext,
      uploadDate: new Date(),
    });

    console.log("✅ Saved to DB:", newMat._id);

    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      mat: newMat,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    return NextResponse.json(
      { success: false, message: "Upload failed", error: err.message },
      { status: 500 }
    );
  }
}
