import fs from "node:fs/promises";
import path from "node:path";

const DATA_FILE = path.join(process.cwd(), "petanque-inscriptions.json");

const CRENEAUX = [
  "Mardi 05/05 - 17h00",
  "Mardi 05/05 - 17h45",
  "Jeudi 07/05 - 17h00",
  "Jeudi 07/05 - 17h45",
  "Mardi 12/05 - 17h00",
  "Mardi 12/05 - 17h45",
  "Mardi 19/05 - 17h00",
  "Mardi 19/05 - 17h45",
  "Jeudi 21/05 - 17h00",
  "Jeudi 21/05 - 17h45",
  "Mardi 26/05 - 17h00",
  "Mardi 26/05 - 17h45",
  "Jeudi 28/05 - 17h00",
  "Jeudi 28/05 - 17h45"
];

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const inscriptions = await readData();
      return json(res, 200, { inscriptions });
    }

    if (req.method === "POST") {
      const body = req.body && Object.keys(req.body).length
        ? req.body
        : await getRawJson(req);

      const nom = String(body.nom || "").trim().toUpperCase();
      const prenom = String(body.prenom || "").trim();
      const creneau = String(body.creneau || "").trim();

      if (!nom || !prenom || !creneau) {
        return json(res, 400, { error: "Nom, prénom et créneau sont obligatoires." });
      }

      if (!CRENEAUX.includes(creneau)) {
        return json(res, 400, { error: "Créneau invalide." });
      }

      const inscriptions = await readData();
      const joueurs = inscriptions[creneau] || [];

      if (joueurs.length >= 4) {
        return json(res, 409, { error: "Ce créneau est complet." });
      }

      const dejaInscrit = joueurs.some(j =>
        j.nom.toLowerCase() === nom.toLowerCase() &&
        j.prenom.toLowerCase() === prenom.toLowerCase()
      );

      if (dejaInscrit) {
        return json(res, 409, { error: "Cette personne est déjà inscrite à ce créneau." });
      }

      joueurs.push({
        nom,
        prenom,
        date_inscription: new Date().toISOString()
      });

      inscriptions[creneau] = joueurs;

      await writeData(inscriptions);

      return json(res, 200, {
        ok: true,
        message: "Inscription confirmée.",
        inscriptions
      });
    }

    return json(res, 405, { error: "Méthode non autorisée." });
  } catch (err) {
    console.error("Erreur API pétanque:", err);
    return json(res, 500, { error: "Erreur serveur." });
  }
}

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

function getRawJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on?.("data", chunk => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        req.destroy?.();
      }
    });

    req.on?.("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (e) {
        reject(e);
      }
    });

    req.on?.("error", reject);
  });
}