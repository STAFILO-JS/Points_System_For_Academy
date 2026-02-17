const API_BASE = "";

const statusText = document.getElementById("statusText");
const whoText = document.getElementById("whoText");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const loginMessage = document.getElementById("loginMessage");

const loadStudentsBtn = document.getElementById("loadStudentsBtn");
const studentsContainer = document.getElementById("studentsContainer");


const teacherPanel = document.getElementById("teacherPanel");
const studentPanel = document.getElementById("studentPanel");

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const createStudentBtn = document.getElementById("createStudentBtn");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentPassword = document.getElementById("studentPassword");
const studentMessage = document.getElementById("studentMessage");

const subjectName = document.getElementById("subjectName");
const createSubjectBtn = document.getElementById("createSubjectBtn");
const loadSubjectsBtn = document.getElementById("loadSubjectsBtn");
const subjectMessage = document.getElementById("subjectMessage");

const subjectSelect = document.getElementById("subjectSelect");
const scoreStudentId = document.getElementById("scoreStudentId");
const scoreValue = document.getElementById("scoreValue");
const setScoreBtn = document.getElementById("setScoreBtn");
const scoreMessage = document.getElementById("scoreMessage");

const loadScoresBtn = document.getElementById("loadScoresBtn");
const scoresContainer = document.getElementById("scoresContainer");

function getToken() {
  return localStorage.getItem("accessToken");
}

function setToken(token) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}

async function api(path, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = data?.error || (typeof data === "string" ? data : "Request failed");
    throw new Error(msg);
  }

  return data;
}

function setLoggedOutUI() {
  statusText.textContent = "Not logged in";
  whoText.textContent = "";
  teacherPanel.classList.add("hidden");
  studentPanel.classList.add("hidden");
}

function renderTable(rows) {
  if (!rows || rows.length === 0) return `<p class="muted">No scores yet.</p>`;

  const body = rows
    .map(r => {
      const subject = r.subject?.name ?? "Unknown";
      const score = r.score ?? "";
      return `<tr><td>${escapeHtml(subject)}</td><td>${escapeHtml(String(score))}</td></tr>`;
    })
    .join("");

  return `
    <table>
      <thead>
        <tr><th>Subject</th><th>Score</th></tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[c]));
}

async function loadSubjects() {
  const subjects = await api("/admin/subjects");
  subjectSelect.innerHTML = "";

  subjects.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.name} (id=${s.id})`;
    subjectSelect.appendChild(opt);
  });

  return subjects.length;
}

async function refreshMe() {
  const token = getToken();
  if (!token) {
    setLoggedOutUI();
    return;
  }

  try {
    const me = await api("/me");
    statusText.textContent = "Logged in";
    whoText.textContent = `${me.email} (${me.role}) id=${me.id}`;

    if (me.role === "TEACHER") {
      teacherPanel.classList.remove("hidden");
      studentPanel.classList.add("hidden");
      try {
        const n = await loadSubjects();
        subjectMessage.textContent = `Loaded ${n} subjects`;
        subjectMessage.className = "success";
      } catch (e) {
        subjectMessage.textContent = e.message;
        subjectMessage.className = "error";
      }
    } else {
      studentPanel.classList.remove("hidden");
      teacherPanel.classList.add("hidden");
    }
  } catch {
    setToken(null);
    setLoggedOutUI();
  }
}

loginBtn.addEventListener("click", async () => {
  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const data = await api("/auth/login", "POST", { email, password });
    setToken(data.accessToken);

    loginMessage.textContent = "Login successful";
    loginMessage.className = "success";

    await refreshMe();
  } catch (e) {
    loginMessage.textContent = e.message;
    loginMessage.className = "error";
  }
});

logoutBtn.addEventListener("click", () => {
  setToken(null);
  setLoggedOutUI();
});

refreshBtn.addEventListener("click", refreshMe);

createStudentBtn.addEventListener("click", async () => {
  try {
    const body = {
      name: studentName.value.trim(),
      email: studentEmail.value.trim(),
      password: studentPassword.value,
    };

    const created = await api("/admin/students", "POST", body);

    studentMessage.textContent = `Student created: id=${created.id}`;
    studentMessage.className = "success";

    studentName.value = "";
    studentEmail.value = "";
    studentPassword.value = "";
  } catch (e) {
    studentMessage.textContent = e.message;
    studentMessage.className = "error";
  }
});

createSubjectBtn.addEventListener("click", async () => {
  try {
    const name = subjectName.value.trim();
    if (!name) throw new Error("Enter subject name");

    await api("/admin/subjects", "POST", { name });

    subjectMessage.textContent = "Subject created";
    subjectMessage.className = "success";
    subjectName.value = "";

    const n = await loadSubjects();
    subjectMessage.textContent = `Subject created. Loaded ${n} subjects`;
  } catch (e) {
    subjectMessage.textContent = e.message;
    subjectMessage.className = "error";
  }
});

loadSubjectsBtn.addEventListener("click", async () => {
  try {
    const n = await loadSubjects();
    subjectMessage.textContent = `Loaded ${n} subjects`;
    subjectMessage.className = "success";
  } catch (e) {
    subjectMessage.textContent = e.message;
    subjectMessage.className = "error";
  }
});

setScoreBtn.addEventListener("click", async () => {
  try {
    const studentId = Number(scoreStudentId.value);
    const subjectId = Number(subjectSelect.value);
    const score = Number(scoreValue.value);

    if (!studentId || !subjectId || Number.isNaN(score)) {
      throw new Error("studentId, subject, and numeric score required");
    }

    await api("/admin/scores", "PUT", { studentId, subjectId, score });

    scoreMessage.textContent = "Score saved";
    scoreMessage.className = "success";
  } catch (e) {
    scoreMessage.textContent = e.message;
    scoreMessage.className = "error";
  }
});

loadScoresBtn.addEventListener("click", async () => {
  try {
    const scores = await api("/me/scores");
    scoresContainer.innerHTML = renderTable(scores);
  } catch (e) {
    scoresContainer.innerHTML = `<p class="error">${escapeHtml(e.message)}</p>`;
  }
});

function renderStudents(rows) {
  if (!rows || rows.length === 0) return `<p class="muted">No students.</p>`;

  const body = rows
    .map(r => `<tr><td>${escapeHtml(String(r.id))}</td><td>${escapeHtml(r.name || "")}</td><td>${escapeHtml(r.email || "")}</td></tr>`)
    .join("");

  return `
    <table>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th></tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

async function loadStudents() {
  const students = await api("/admin/students");
  studentsContainer.innerHTML = renderStudents(students);
}

loadStudentsBtn?.addEventListener("click", async () => {
  try {
    await loadStudents();
  } catch (e) {
    studentsContainer.innerHTML = `<p class="error">${escapeHtml(e.message)}</p>`;
  }
});


refreshMe();
