import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

const DATA_FILE = "/data/status.json";

function initData() {
  if (!fs.existsSync(DATA_FILE)) {
    const pcs = [];
    for (let i = 1; i <= 20; i++) {
      pcs.push({
        name: `Render-${String(i).padStart(2, "0")}`,
        status: "IDLE",
        usedBy: "",
        since: ""
      });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(pcs, null, 2));
  }
}

function loadData() {
  initData();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Render PC Status</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: Arial; background:#f5f5f5; padding:20px; }
    h2 { margin-bottom: 10px; }
    table { width:100%; border-collapse: collapse; background:#fff; border-radius:10px; overflow:hidden; }
    th, td { padding:12px; border-bottom:1px solid #eee; text-align:left; }
    th { background:#222; color:#fff; }
    .idle { color:green; font-weight:bold; }
    .busy { color:red; font-weight:bold; }
    button { padding:6px 12px; border:none; border-radius:6px; cursor:pointer; margin-left:4px; }
    .take { background:#007bff; color:#fff; }
    .release { background:#dc3545; color:#fff; }
    input { padding:6px; width:120px; }
  </style>
</head>
<body>
  <h2>Render PC Live Status Dashboard</h2>
  <p>Type your name (K / J) → click <b>Take</b>. After work click <b>Release</b>.</p>

  <table id="tbl">
    <thead>
      <tr>
        <th>Render PC</th>
        <th>Status</th>
        <th>Used By</th>
        <th>Since</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>

<script>
async function load() {
  const res = await fetch("/api/status");
  const data = await res.json();
  const tbody = document.querySelector("#tbl tbody");
  tbody.innerHTML = "";

  data.forEach((pc, idx) => {
    const tr = document.createElement("tr");
    const statusClass = pc.status === "IDLE" ? "idle" : "busy";

    tr.innerHTML = \`
      <td><b>\${pc.name}</b></td>
      <td class="\${statusClass}">\${pc.status}</td>
      <td>\${pc.usedBy || "-"}</td>
      <td>\${pc.since || "-"}</td>
      <td>
        <input placeholder="Your name" id="name-\${idx}" />
        <button class="take" onclick="takePC(\${idx})">Take</button>
        <button class="release" onclick="releasePC(\${idx})">Release</button>
      </td>
    \`;
    tbody.appendChild(tr);
  });
}

async function takePC(i) {
  const name = document.getElementById("name-" + i).value.trim();
  if (!name) return alert("Enter your name (example: K / J)");
  await fetch("/api/take/" + i, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name })
  });
  load();
}

async function releasePC(i) {
  await fetch("/api/rele
