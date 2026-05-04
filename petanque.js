const CRENEAUX = [
  "Mardi 19/05 - 17h00","Mardi 19/05 - 17h45",
  "Jeudi 21/05 - 17h00","Jeudi 21/05 - 17h45",
  "Mardi 26/05 - 17h00","Mardi 26/05 - 17h45",
  "Jeudi 28/05 - 17h00","Jeudi 28/05 - 17h45",

  "Mardi 02/06 - 17h00","Mardi 02/06 - 17h45",
  "Jeudi 04/06 - 17h00","Jeudi 04/06 - 17h45",
  "Mardi 09/06 - 17h00","Mardi 09/06 - 17h45",
  "Jeudi 11/06 - 17h00","Jeudi 11/06 - 17h45",
  "Mardi 16/06 - 17h00","Mardi 16/06 - 17h45",
  "Jeudi 18/06 - 17h00","Jeudi 18/06 - 17h45",
  "Mardi 23/06 - 17h00","Mardi 23/06 - 17h45",
  "Jeudi 25/06 - 17h00","Jeudi 25/06 - 17h45",
  "Mardi 30/06 - 17h00","Mardi 30/06 - 17h45",

  "Jeudi 02/07 - 17h00","Jeudi 02/07 - 17h45",
  "Mardi 07/07 - 17h00","Mardi 07/07 - 17h45",
  "Jeudi 09/07 - 17h00","Jeudi 09/07 - 17h45"
];

const selectCreneau = document.getElementById("creneau");
const listeCreneaux = document.getElementById("listeCreneaux");
const btnInscription = document.getElementById("btnInscription");
const message = document.getElementById("message");

let inscriptions = {};

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

function afficherCreneaux() {
  listeCreneaux.innerHTML = "";

  CRENEAUX.forEach(creneau => {
    const joueurs = inscriptions[creneau] || [];
    const complet = joueurs.length >= 4;
    const placesRestantes = 4 - joueurs.length;

    const div = document.createElement("div");
    div.className = "slot-card";

    div.innerHTML = `
      <h3>${creneau}</h3>
      <p><strong>${placesRestantes} place(s) restante(s)</strong></p>
      <p>${joueurs.length}/4 joueurs inscrits</p>

      <div class="team">
        <p>Joueur 1 : ${joueurs[0] ? joueurs[0].prenom + " " + joueurs[0].nom : "—"}</p>
        <p>Joueur 2 : ${joueurs[1] ? joueurs[1].prenom + " " + joueurs[1].nom : "—"}</p>
        <p>Joueur 3 : ${joueurs[2] ? joueurs[2].prenom + " " + joueurs[2].nom : "—"}</p>
        <p>Joueur 4 : ${joueurs[3] ? joueurs[3].prenom + " " + joueurs[3].nom : "—"}</p>
      </div>
    `;

    listeCreneaux.appendChild(div);
  });
}

async function chargerInscriptions() {
  const res = await fetch("/api/petanque");
  const data = await res.json();
  inscriptions = data.inscriptions || {};
  remplirSelect();
  afficherCreneaux();
}

btnInscription.addEventListener("click", async () => {
  const nom = document.getElementById("nom").value.trim().toUpperCase();
  const prenom = document.getElementById("prenom").value.trim();
  const creneau = selectCreneau.value;

  const res = await fetch("/api/petanque", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nom, prenom, creneau })
  });

  const data = await res.json();

  if (!res.ok) {
    message.textContent = "❌ " + data.error;
    return;
  }

  message.textContent = "✅ Inscription confirmée !";
  chargerInscriptions();
});

chargerInscriptions();
