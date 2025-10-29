import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/db";
import { User } from "../../../lib/models";

export async function POST(req) {
  try {
    await connectDB();
    const { username, email, password, role } = await req.json();

    const existing = await User.findOne({ email });
    if (existing)
      return NextResponse.json({ message: "User already exists" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashed, role: role || "user" });
    await newUser.save();

    return NextResponse.json({ message: "✅ User registered successfully" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
