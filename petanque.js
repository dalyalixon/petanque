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

  CRENEAUX.forEach(creneau => {
    const joueurs = inscriptions[creneau] || [];
    const complet = joueurs.length >= 4;
    const placesRestantes = 4 - joueurs.length;

    const statut = complet
      ? `<span class="status-full">COMPLET</span>`
      : `<span class="status-ok">${placesRestantes} place(s) restante(s)</span>`;

    const div = document.createElement("div");
    div.className = complet ? "slot-card slot-full" : "slot-card";

    div.innerHTML = `
      <div class="slot-header">
        <h3>${escapeHtml(creneau)}</h3>
        ${statut}
      </div>

      <div class="slot-count">
        <strong>${joueurs.length}/4 joueurs inscrits</strong>
      </div>

      <div class="teams">
        <div class="team">
          <strong>Équipe A</strong>
          <p>Joueur 1 : ${joueurs[0] ? escapeHtml(joueurs[0].prenom + " " + joueurs[0].nom) : "—"}</p>
          <p>Joueur 2 : ${joueurs[1] ? escapeHtml(joueurs[1].prenom + " " + joueurs[1].nom) : "—"}</p>
        </div>

        <div class="team">
          <strong>Équipe B</strong>
          <p>Joueur 3 : ${joueurs[2] ? escapeHtml(joueurs[2].prenom + " " + joueurs[2].nom) : "—"}</p>
          <p>Joueur 4 : ${joueurs[3] ? escapeHtml(joueurs[3].prenom + " " + joueurs[3].nom) : "—"}</p>
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