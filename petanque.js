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

const selectCreneau = document.getElementById("creneau");
const listeCreneaux = document.getElementById("listeCreneaux");
const btnInscription = document.getElementById("btnInscription");
const message = document.getElementById("message");

let inscriptions = {};

/* ================== REMPLIR SELECT ================== */
function remplirSelect() {
  selectCreneau.innerHTML = `<option value="">Sélectionnez un créneau</option>`;

  CRENEAUX.forEach(creneau => {
    const joueurs = inscriptions[creneau] || [];
    const placesRestantes = 4 - joueurs.length;

    const option = document.createElement("option");
    option.value = creneau;

    if (placesRestantes <= 0) {
      option.textContent = `${creneau} — COMPLET`;
      option.disabled = true;
    } else {
      option.textContent = `${creneau} — ${placesRestantes} place(s) restante(s)`;
    }

    selectCreneau.appendChild(option);
  });
}

/* ================== AFFICHAGE ================== */
function afficherCreneaux() {
  listeCreneaux.innerHTML = "";

  // 🔹 regrouper par jour
  const jours = {};

  CRENEAUX.forEach(creneau => {
    const jour = creneau.split(" - ")[0]; // "Mardi 05/05"
    if (!jours[jour]) jours[jour] = [];
    jours[jour].push(creneau);
  });

  // 🔹 afficher 1 bloc par jour
  Object.entries(jours).forEach(([jour, creneauxDuJour]) => {

    let joueursJour = [];

    // fusionner les joueurs des 2 créneaux
    creneauxDuJour.forEach(c => {
      const joueurs = inscriptions[c] || [];
      joueursJour = joueursJour.concat(joueurs);
    });

    const total = joueursJour.length;
    const placesRestantes = 4 - total;
    const complet = total >= 4;

    const div = document.createElement("div");
    div.className = complet ? "slot-card slot-full" : "slot-card";

    div.innerHTML = `
      <div class="slot-header">
        <h3>${escapeHtml(jour)}</h3>
        ${
          complet
            ? `<span class="status-full">COMPLET</span>`
            : `<span class="status-ok">${placesRestantes} place(s) restante(s)</span>`
        }
      </div>

      <div class="slot-count">
        <strong>${total}/4 joueurs inscrits</strong>
      </div>

      <div class="teams">
        <div class="team">
          <strong></strong>
          <p>Joueur 1 : ${joueursJour[0] ? joueursJour[0].prenom + " " + joueursJour[0].nom : "—"}</p>
          <p>Joueur 2 : ${joueursJour[1] ? joueursJour[1].prenom + " " + joueursJour[1].nom : "—"}</p>
        </div>

        <div class="team">
          <strong></strong>
          <p>Joueur 3 : ${joueursJour[2] ? joueursJour[2].prenom + " " + joueursJour[2].nom : "—"}</p>
          <p>Joueur 4 : ${joueursJour[3] ? joueursJour[3].prenom + " " + joueursJour[3].nom : "—"}</p>
        </div>
      </div>
    `;

    listeCreneaux.appendChild(div);
  });
}
/* ================== CHARGEMENT ================== */
async function chargerInscriptions() {
  try {
    const res = await fetch("/api/petanque");
    const data = await res.json();

    inscriptions = data.inscriptions || {};

    remplirSelect();
    afficherCreneaux();
  } catch (err) {
    console.error(err);

    inscriptions = {};

    remplirSelect();
    afficherCreneaux();

    message.textContent = "⚠️ Impossible de charger les inscriptions.";
  }
}

/* ================== INSCRIPTION ================== */
btnInscription.addEventListener("click", async () => {
  const nom = document.getElementById("nom").value.trim().toUpperCase();
  const prenom = document.getElementById("prenom").value.trim();
  const creneau = selectCreneau.value;

  message.textContent = "";

  if (!nom || !prenom || !creneau) {
    message.textContent = "❌ Merci de remplir tous les champs.";
    return;
  }

  try {
    const res = await fetch("/api/petanque", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nom, prenom, creneau })
    });

    const data = await res.json();

    if (!res.ok) {
      message.textContent = `❌ ${data.error || "Inscription impossible."}`;
      return;
    }

    message.textContent = "✅ Inscription confirmée !";

    document.getElementById("nom").value = "";
    document.getElementById("prenom").value = "";
    selectCreneau.value = "";

    await chargerInscriptions();
  } catch (err) {
    console.error(err);
    message.textContent = "❌ Erreur serveur.";
  }
});

/* ================== SECURITE ================== */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

/* ================== INIT ================== */
chargerInscriptions();
