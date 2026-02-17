require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("./prisma"); // shared prisma instance
const { requireAuth } = require("./middleware");

const adminRoutes = require("./routes.admin");
const meRoutes = require("./routes.me");

const app = express();
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "..", "public")));

console.log("API DATABASE_URL =", process.env.DATABASE_URL);


// Health Check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    console.error("Health check failed:", e);
    res.status(500).json({ ok: false });
  }
});
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.active) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
      }
    );

    res.json({ accessToken });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

=
app.use("/admin", adminRoutes);
app.use("/", meRoutes);


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong" });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
