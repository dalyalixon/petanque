import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import petanqueHandler from "./api/petanque.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.all("/api/petanque", async (req, res) => {
  return petanqueHandler(req, res);
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "petanque.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});