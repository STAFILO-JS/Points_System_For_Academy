const express = require("express");
const prisma = require("./prisma");
const { requireAuth, requireRole } = require("./middleware");
const bcrypt = require("bcrypt");

const router = express.Router();

router.use(requireAuth, requireRole("TEACHER"));

router.post("/students", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, password required" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const student = await prisma.user.create({
    data: { name, email, passwordHash, role: "STUDENT", active: true },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  res.json(student);
});

router.post("/subjects", async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });

  const subject = await prisma.subject.create({
    data: { name: name.trim() },
  });

  res.json(subject);
});

router.get("/subjects", async (req, res) => {
  const subjects = await prisma.subject.findMany({ orderBy: { id: "asc" } });
  res.json(subjects);
});

router.get("/students", async (req, res) => {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT", active: true },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { id: "asc" },
  });

  res.json(students);
});

router.put("/scores", async (req, res) => {
  const { studentId, subjectId, score } = req.body || {};

  const sId = Number(studentId);
  const subId = Number(subjectId);
  const val = Number(score);

  if (!sId || !subId || Number.isNaN(val)) {
    return res.status(400).json({ error: "studentId, subjectId, score required" });
  }

  const student = await prisma.user.findUnique({ where: { id: sId } });
  if (!student || student.role !== "STUDENT") {
    return res.status(400).json({ error: "Invalid studentId" });
  }

  const subject = await prisma.subject.findUnique({ where: { id: subId } });
  if (!subject) {
    return res.status(400).json({ error: "Invalid subjectId" });
  }

  const saved = await prisma.score.upsert({
    where: { studentId_subjectId: { studentId: sId, subjectId: subId } },
    update: { score: val },
    create: { studentId: sId, subjectId: subId, score: val },
  });

  res.json(saved);
});

module.exports = router;
