import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// ✅ Connect MongoDB once
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect("mongodb+srv://username:password@cluster0.mongodb.net/csbs")
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err));
}

// ✅ Schema & Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Name: { type: String,required:true},
  pb: { type: String },
  isad: { type: Boolean, default: false },
});

const User = mongoose.models.User || mongoose.model("User", userSchema, "users");

// ✅ POST /api/login
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email & password required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ message: "Invalid Password" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1d" }
    );
    console.log(token)
    console.log(user.Name);

    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, message: "Login failed", error: err.message },
      { status: 500 }
    );
  }
}
