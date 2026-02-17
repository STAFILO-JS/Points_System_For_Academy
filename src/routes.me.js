const express = require("express");
const prisma = require("./prisma");
const { requireAuth } = require("./middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/me/scores", async (req, res) => {
  const rows = await prisma.score.findMany({
    where: { studentId: req.user.id },
    include: { subject: true },
    orderBy: { subjectId: "asc" },
  });

  res.json(rows);
});

module.exports = router;
