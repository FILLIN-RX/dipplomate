const API = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  chargerEtudiant();

  const editForm = document.getElementById("edit-form");
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const success = await modifierEtudiant(data);
    if (success) {
      fermerModal();
      chargerEtudiant();
      afficherMessage("✏️ Étudiant modifié avec succès");
    } else {
      afficherMessage("❌ Erreur lors de la modification", "error");
    }
  });

  const form = document.getElementById("ajout-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const success = await CreerEtudiant(data);

    if (success) {
      form.reset();
      chargerEtudiant();
      afficherMessage("✅ Étudiant ajouté avec succès");
    } else {
      afficherMessage("❌ Erreur lors de l'ajout", "error");
    }

    form.reset();
  });
});
///////////////////////////////////////////////////////
//fonction pour creer les etudiant
//////////////////////////////////////////////////////
async function CreerEtudiant(data) {
  const res = await fetch(`${API}/etudiant`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}
///////////////////////////////////////////////////////////////
//fonction pour charger les etudiant
////////////////////////////////////////////////////////////////
async function chargerEtudiant() {
  const container = document.getElementById("etudiants-container");
  container.innerHTML = "chargement...";
  const res = await fetch(`${API}/etudiant`);
  const etudiants = await res.json();
  container.innerHTML = "";
  const div = document.createElement("table");
  const tr = document.createElement("tr");
  const th1 = document.createElement("th");
  th1.innerText = "groupe";
  const th2 = document.createElement("th");
  th2.innerText = "nom";
  const th3 = document.createElement("th");
  th3.innerText="Prenom"
  const th4 = document.createElement("th");
  th4.innerText="SEXE"
  const th5 = document.createElement("th");
  th5.innerText = "DATE DE NAISSANCE"
  const th6 = document.createElement("th");
  th6.innerText = "LIEU DE NAISSANCE"
  const th7 = document.createElement("th");
  th7.innerText= "MATRICULE"
  const th8 = document.createElement("th");
  const th9 = document.createElement("th");
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);
  tr.appendChild(th4);
  tr.appendChild(th5);
  tr.appendChild(th6)
  tr.appendChild(th7)
  tr.appendChild(th8)
  div.appendChild(tr);
  container.appendChild(div);

  for (let e of etudiants) {
    //verifie si etudiant est complet
    const tr = document.createElement("tr");
    const res2 = await fetch(`${API}/etudiant/${e.id}/complet`);
    const status = await res2.json();

    div.className = "etudiant";

    tr.innerHTML = `<td>${e.groupe}</td> <td>${e.nom}</td> <td>${e.prenom} </td> <td>${e.sexe}</td><td>${e.date_naissance}</td><td>${e.lieu_naissance}</td><td>${e.matricule}</td> ${
      status.dossierComplet
        ? "<td class=complet>Dossier complet</td>"
        : '<td class="incomplet">Dossier Incomplet</td>'
    }</th><th>  <button onclick="voirDocuments(${
      e.id
    })">📄 Voir documents</button> <button onclick="handleSuppression(${
      e.id
    })">🗑️ Supprimer</button> <button onclick='ouvrirModal(${JSON.stringify(
      e
    )})'>✏️ Modifier</button>


        <div id="docs-${e.id}"></div> </th>`;
      div.appendChild(tr);
     container.appendChild(div);
  }
}
///////////////////////////////////////////////////////////////
//fonction pour voir les document de un etudiant
///////////////////////////////////////////////////////////////
async function voirDocuments(etudiantId) {
  const container = document.getElementById(`docs-${etudiantId}`);
  container.innerHTML = "chargement.....";

  const res = await fetch(`${API}/etudiant/${etudiantId}/documents`);
  const docs = await res.json();
  container.innerHTML = "";

  container.innerHTML = docs
    .map(
      (d) => `
        <div>
            <label>
                <input 
                    type="checkbox"
                     ${d.fourni ? "checked" : ""}
                     onchange="majFourniture(${etudiantId},${
        d.id
      }, this.checked)"
                />
            ${d.nom_document} 
            </label>
        </div>`
    )
    .join("");
}

////////////////////////////////////////////////////////////////////////
//fonction pour metre a jours le status des dossier de l'etudiant
/////////////////////////////////////////////////////////////////////////
async function majFourniture(etudiantId, documentId, isChecked) {
  await fetch(`${API}/etudiant/${etudiantId}/documents/${documentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fourni: isChecked }),

    //Recharge les etudiant pour mettre ajour leur status
  });
  chargerEtudiant();
}

//////////////////////////////////////////////////////////////////////////////
//function pour supprimer un etudiant
///////////////////////////////////////////////////////////////////////////////
async function supprimerEtudiant(id) {
  if (!confirm("Supprimer cet étudiant ?")) return;

  const res = await fetch(`${API}/etudiant/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

async function handleSuppression(id) {
  if (!confirm("❓ Supprimer cet étudiant ?")) return;

  const success = await supprimerEtudiant(id);

  if (success) {
    afficherMessage("🗑️ Étudiant supprimé avec succès");
    chargerEtudiant();
  } else {
    afficherMessage("❌ Échec de la suppression", "error");
  }
}
////////////////////////////////////////////////////////
//fonction pour ouvrir le modale de modification
//////////////////////////////////////////////////////////
function ouvrirModal(etudiant) {
  document.getElementById("edit-id").value = etudiant.id;
  document.getElementById("edit-nom").value = etudiant.nom;
  document.getElementById("edit-prenom").value = etudiant.prenom;
  document.getElementById("edit-sexe").value = etudiant.sexe;
  document.getElementById("edit-date").value =
    etudiant.date_naissance?.split("T")[0];
  document.getElementById("edit-lieu").value = etudiant.lieu_naissance;
  document.getElementById("edit-matricule").value = etudiant.matricule;
  document.getElementById("edit-groupe").value = etudiant.groupe;

  document.getElementById("edit-modal").style.display = "flex";
}
///////////////////////////////////////////////////////////
//fonction pour fermer le modal
//////////////////////////////////////////////////////////
function fermerModal() {
  document.getElementById("edit-modal").style.display = "none";
}
/////////////////////////////////////////////////////////
//fonction pour modifier un etudiant
////////////////////////////////////////////////////////
async function modifierEtudiant(data) {
  const id = data.id;
  delete data.id;

  const res = await fetch(`${API}/etudiant/${id}`, {
    method: "put",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}
///////////////////////////////////////////////////////////
//fonction pour afficher les messages
////////////////////////////////////////////////////////////
function afficherMessage(texte, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = texte;

  container.appendChild(toast);

  // Supprimer le toast après 3 secondes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
