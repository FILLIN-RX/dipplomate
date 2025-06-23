///////////////////////////////////////////////////////
// Constantes et initialisation
///////////////////////////////////////////////////////
const API = "http://localhost:5000";

// Éléments DOM globaux
const DOM = {
  etudiantsContainer: document.getElementById("etudiants-container"),
  ajoutForm: document.getElementById("ajout-form"),
  editForm: document.getElementById("edit-form"),
  editModal: document.getElementById("edit-modal"),
  createModal: document.getElementById("create-form"),
  toastContainer: document.getElementById("toast-container"),
  EtudiantComplet: document.getElementById("etudiant-complet"),
};

///////////////////////////////////////////////////////
// Chargement initial
///////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  chargerEtudiants();
});

///////////////////////////////////////////////////////
// Fonction pour initialiser les écouteurs d'événements
///////////////////////////////////////////////////////
function initEventListeners() {
  DOM.editForm.addEventListener("submit", handleEditSubmit);
  DOM.ajoutForm.addEventListener("submit", handleAjoutSubmit);
}

///////////////////////////////////////////////////////
// Fonctions pour gérer les soumissions de formulaire
///////////////////////////////////////////////////////
async function handleEditSubmit(e) {
  e.preventDefault();

  try {
    const data = getFormData(DOM.editForm);
    const success = await modifierEtudiant(data);

    if (success) {
      fermerModal();
      chargerEtudiants();
      afficherMessage("✏️ Étudiant modifié avec succès");
    } else {
      throw new Error("Erreur lors de la modification");
    }
  } catch (error) {
    console.error("Erreur modification étudiant:", error);
    afficherMessage("❌ Erreur lors de la modification", "error");
  }
}

async function handleAjoutSubmit(e) {
  e.preventDefault();

  try {
    const data = getFormData(DOM.ajoutForm);
    const success = await creerEtudiant(data);

    if (success) {
      DOM.ajoutForm.reset();
      chargerEtudiants();
      afficherMessage("✅ Étudiant ajouté avec succès");
    } else {
      throw new Error("Erreur lors de l'ajout");
    }
  } catch (error) {
    console.error("Erreur ajout étudiant:", error);
    afficherMessage("❌ Erreur lors de l'ajout", "error");
  }
}

///////////////////////////////////////////////////////
// Fonction utilitaire pour récupérer les données de formulaire
///////////////////////////////////////////////////////
function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

///////////////////////////////////////////////////////
// Fonctions pour charger et afficher les étudiants
///////////////////////////////////////////////////////
async function chargerEtudiants() {
  try {
    DOM.etudiantsContainer.innerHTML = "Chargement en cours...";

    const response = await fetch(`${API}/etudiant`);
    if (!response.ok) throw new Error("Erreur réseau");

    const etudiants = await response.json();
    afficherEtudiants(etudiants);
  } catch (error) {
    console.error("Erreur chargement étudiants:", error);
    DOM.etudiantsContainer.innerHTML = "❌ Erreur lors du chargement";
  }
}
/////////////////////////////////////////////////////
//function pour charger les etudiant complet
/////////////////////////////////////////////////////
async function chargerEtudiantsComplet() {
  try {
    DOM.etudiantsContainer.innerHTML = "Chargement en cous......";
    const response = await fetch(`${API}/etudiants/complets`);
    if (!response) throw new Error("Erreur reseau");

    const etudiants = await response.json();
    afficherEtudiants(etudiants);
  } catch (error) {
    console.error("Erreur chargement étudiants:", error);
    DOM.etudiantsContainer.innerHTML = "❌ Erreur lors du chargement";
  }
}
////////////////////////////////////////////////////////
///function pour charger les etudiant incomplet
////////////////////////////////////////////////////////////
async function chargerEtudiantsIncomplet() {
  try {
    DOM.etudiantsContainer.innerHTML = "chargement en cours..........";
    const response = await fetch(`${API}/etudiants/incomplets`);
    if (!response) {
      throw new Error("Erreur reseau");
    }
    const etudiant = await response.json();
    afficherEtudiants(etudiant);
  } catch (error) {
    console.error("Erreur chargement étudiants:", error);
    DOM.etudiantsContainer.innerHTML = "❌ Erreur lors du chargement";
  }
}
async function afficherEtudiants(etudiants) {
  if (!etudiants || etudiants.length === 0) {
    DOM.etudiantsContainer.innerHTML = "Aucun étudiant à afficher";
    return;
  }

  const table = document.createElement("table");
  table.appendChild(creerEntetesTableau());

  for (const etudiant of etudiants) {
    const row = await creerLigneEtudiant(etudiant);
    table.appendChild(row);
  }

  DOM.etudiantsContainer.innerHTML = "";
  DOM.etudiantsContainer.appendChild(table);
}

///////////////////////////////////////////////////////
// Fonctions pour créer la structure du tableau
///////////////////////////////////////////////////////
function creerEntetesTableau() {
  const entetes = [
    "Groupe",
    "Nom",
    "Prénom",
    "Sexe",
    "Date de naissance",
    "Lieu de naissance",
    "Matricule",
    "Statut",
    "Actions",
  ];

  const tr = document.createElement("tr");
  entetes.forEach((texte) => {
    const th = document.createElement("th");
    th.textContent = texte;
    tr.appendChild(th);
  });

  return tr;
}

async function creerLigneEtudiant(etudiant) {
  const tr = document.createElement("tr");
  const status = await verifierCompletudeDossier(etudiant.id);

  tr.innerHTML = `
    <td>${etudiant.groupe}</td>
    <td>${etudiant.nom}</td>
    <td>${etudiant.prenom}</td>
    <td>${etudiant.sexe}</td>
    <td>${formatDate(etudiant.date_naissance)}</td>
    <td>${etudiant.lieu_naissance}</td>
    <td>${etudiant.matricule}</td>
    <td class="${status.dossierComplet ? "complet" : "incomplet"}">
      ${status.dossierComplet ? "Dossier complet" : "Dossier incomplet"}
    </td>
    <td class="actions">
      <button onclick="voirDocuments(${etudiant.id})">📄 Voir documents</button>
      <button onclick="handleSuppression(${etudiant.id})">🗑️ Supprimer</button>
      <button onclick='ouvrirModal(${JSON.stringify(
        etudiant
      )})'>✏️ Modifier</button>
      <div id="docs-${etudiant.id}"></div>
    </td>
  `;

  return tr;
}

///////////////////////////////////////////////////////
// Fonctions pour vérifier l'état des dossiers
///////////////////////////////////////////////////////
async function verifierCompletudeDossier(etudiantId) {
  try {
    const response = await fetch(`${API}/etudiant/${etudiantId}/complet`);
    if (!response.ok) throw new Error("Erreur vérification dossier");
    return await response.json();
  } catch (error) {
    console.error("Erreur vérification dossier:", error);
    return { dossierComplet: false };
  }
}

///////////////////////////////////////////////////////
// Fonctions pour gérer les documents
///////////////////////////////////////////////////////
async function voirDocuments(etudiantId) {
  const container = document.getElementById(`docs-${etudiantId}`);

  try {
    container.innerHTML = "Chargement des documents...";
    container.classList.add("modal");

    const response = await fetch(`${API}/etudiant/${etudiantId}/documents`);
    if (!response.ok) throw new Error("Erreur chargement documents");

    const docs = await response.json();
    afficherDocuments(container, docs, etudiantId);
  } catch (error) {
    console.error("Erreur chargement documents:", error);
    container.innerHTML = "❌ Erreur lors du chargement";
  }
}

function afficherDocuments(container, docs, etudiantId) {
  const containerContent = document.createElement("div");
  containerContent.classList.add("containerContent");

  containerContent.innerHTML = docs
    .map(
      (doc) => `
    <div class="document-item">
      <label>
        <input 
          type="checkbox"
          ${doc.fourni ? "checked" : ""}
          onchange="event.stopPropagation(); majFourniture(${etudiantId}, ${
        doc.id
      }, this.checked,event)"
        />
        ${doc.nom_document}
      </label>
    </div>
  `
    )
    .join("");

  container.innerHTML = "";
  container.appendChild(containerContent);
}

///////////////////////////////////////////////////////
// Fonctions utilitaires diverses
///////////////////////////////////////////////////////
function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
}
///////////////////////////////////////////////////////
// Fonction pour supprimer un étudiant
///////////////////////////////////////////////////////
async function supprimerEtudiant(id) {
  if (!confirm("Supprimer cet étudiant ?")) return false;

  try {
    const res = await fetch(`${API}/etudiant/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (error) {
    console.error("Erreur suppression:", error);
    return false;
  }
}

///////////////////////////////////////////////////////
// Handler pour la suppression
///////////////////////////////////////////////////////
async function handleSuppression(id) {
  if (!confirm("❓ Supprimer cet étudiant ?")) return;

  const success = await supprimerEtudiant(id);

  if (success) {
    afficherMessage("🗑️ Étudiant supprimé avec succès");
    chargerEtudiants();
  } else {
    afficherMessage("❌ Échec de la suppression", "error");
  }
}

///////////////////////////////////////////////////////
// Fonction pour modifier un étudiant
///////////////////////////////////////////////////////
async function modifierEtudiant(data) {
  const id = data.id;
  delete data.id;

  try {
    const res = await fetch(`${API}/etudiant/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (error) {
    console.error("Erreur modification:", error);
    return false;
  }
}

///////////////////////////////////////////////////////
// Fonctions pour gérer la modal de modification
///////////////////////////////////////////////////////
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

  DOM.editModal.style.display = "flex";
}
function createModal() {
  DOM.createModal.style.display = "flex";
}
function fermerCreateModal() {
  DOM.createModal.style.display = "none";
}
function fermerModal() {
  DOM.editModal.style.display = "none";
}

///////////////////////////////////////////////////////
// Fonction pour mettre à jour les documents fournis
///////////////////////////////////////////////////////
async function majFourniture(etudiantId, documentId, isChecked) {
  try {
    const checkbox = event.target;
    checkbox.disabled = true;
    const response = await fetch(
      `${API}/etudiant/${etudiantId}/documents/${documentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fourni: isChecked }),
      }
    );
    if (!response) {
      throw new Error("Erreur serveur");
    }
    checkbox.checked = isChecked;
    afficherMessage("✓ Document mis à jour");
    chargerEtudiants();
  } catch (error) {
    console.error("Erreur MAJ document:", error);
    checkbox.checked = !isChecked;
    afficherMessage("❌ Erreur mise à jour document", "error");
  } finally {
    checkbox.disabled = false;
  }
}

///////////////////////////////////////////////////////
// Fonction pour créer un nouvel étudiant
///////////////////////////////////////////////////////
async function creerEtudiant(data) {
  try {
    const res = await fetch(`${API}/etudiant`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (error) {
    console.error("Erreur création:", error);
    return false;
  }
}
// ... (autres fonctions comme ouvrirModal, fermerModal, etc. conservent leur style original)
