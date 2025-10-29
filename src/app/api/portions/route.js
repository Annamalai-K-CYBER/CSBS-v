"use server";
import mongoose from "mongoose";

/* -------------------- MongoDB connect -------------------- */
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/csbs")
    .then(() => console.log("✅ MongoDB connected (portions)"))
    .catch((err) => console.error("❌ MongoDB error:", err));
}

/* -------------------- Schema / Model -------------------- */
const portionSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    staff: { type: String, required: true }, // ✅ added staff field
    completedTopics: [{ type: String }],
  },
  { collection: "portions", timestamps: true }
);

const Portion = mongoose.models.Portion || mongoose.model("Portion", portionSchema);

/* -------------------- GET all portions -------------------- */
export async function GET() {
  try {
    const data = await Portion.find();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ GET error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: err.message || "Failed to fetch portions",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/* -------------------- POST add completed topic -------------------- */
/* Expects body: { subject: "Math", topic: "Integration", staff: "John" } */
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 Received body:", body);

    const { subject, topic, staff } = body;

    if (!subject || !topic || !staff) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Subject, topic, and staff are all required.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trim input
    const subj = String(subject).trim();
    const top = String(topic).trim();
    const teacher = String(staff).trim();

    if (!subj || !top || !teacher) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Subject, topic, and staff cannot be empty.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔍 Find portion by both subject & staff (unique per staff)
    let portion = await Portion.findOne({ subject: subj, staff: teacher });

    // 🆕 Create if not exists
    if (!portion) {
      portion = new Portion({ subject: subj, staff: teacher, completedTopics: [] });
    }

    // 🚫 Avoid duplicate topic entries
    if (!portion.completedTopics.includes(top)) {
      portion.completedTopics.push(top);
      await portion.save();
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          data: portion,
          message: "Topic already exists for this staff.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: portion }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ POST error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: err.message || "Failed to add topic",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
