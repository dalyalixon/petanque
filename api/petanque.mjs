import { createClient } from "@supabase/supabase-js";

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

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return json(res, 500, { error: "Configuration Supabase manquante." });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("inscriptions")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erreur Supabase GET:", error);
        return json(res, 500, { error: "Erreur récupération inscriptions." });
      }

      const inscriptions = {};

      for (const row of data || []) {
        if (!inscriptions[row.creneau]) inscriptions[row.creneau] = [];

        inscriptions[row.creneau].push({
          id: row.id,
          nom: row.nom,
          prenom: row.prenom,
          date_inscription: row.created_at
        });
      }

      return json(res, 200, { inscriptions });
    }

    if (req.method === "POST") {
      const body =
        req.body && Object.keys(req.body).length
          ? req.body
          : await getRawJson(req);

      const nom = String(body.nom || "").trim().toUpperCase();
      const prenom = String(body.prenom || "").trim();
      const creneau = String(body.creneau || "").trim();

      if (!nom || !prenom || !creneau) {
        return json(res, 400, {
          error: "Nom, prénom et créneau sont obligatoires."
        });
      }

      if (!CRENEAUX.includes(creneau)) {
        return json(res, 400, { error: "Créneau invalide." });
      }

      const { data: existing, error: countError } = await supabase
        .from("inscriptions")
        .select("*")
        .eq("creneau", creneau);

      if (countError) {
        console.error("Erreur Supabase count:", countError);
        return json(res, 500, { error: "Erreur vérification créneau." });
      }

      const joueurs = existing || [];

      if (joueurs.length >= 4) {
        return json(res, 409, { error: "Ce créneau est complet." });
      }

      const dejaInscrit = joueurs.some(j =>
        String(j.nom || "").toLowerCase() === nom.toLowerCase() &&
        String(j.prenom || "").toLowerCase() === prenom.toLowerCase()
      );

      if (dejaInscrit) {
        return json(res, 409, {
          error: "Cette personne est déjà inscrite à ce créneau."
        });
      }

      const { error: insertError } = await supabase
        .from("inscriptions")
        .insert([
          {
            nom,
            prenom,
            creneau
          }
        ]);

      if (insertError) {
        console.error("Erreur Supabase insert:", insertError);
        return json(res, 500, { error: "Erreur enregistrement inscription." });
      }

      return json(res, 200, {
        ok: true,
        message: "Inscription confirmée."
      });
    }

    return json(res, 405, { error: "Méthode non autorisée." });
  } catch (err) {
    console.error("Erreur API pétanque:", err);
    return json(res, 500, { error: "Erreur serveur." });
  }
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
