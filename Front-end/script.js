const API = "http://localhost:5000"

document.addEventListener("DOMContentLoaded",()=>{
    chargerEtudiant()


}) 

async function chargerEtudiant() {
    const container = document.getElementById("etudiants-container")
    container.innerHTML = "chargement..."
    const res = await fetch(`${API}/etudiant`)
    const etudiants = await res.json()
    container.innerHTML = ""
    for (let e of etudiants) {
        const div = document.createElement("div")
        div.className ="etudiant"

        div.innerHTML = ` <strong>${e.nom} ${e.prenom}</strong> <button onclick="voirDocuments(${e.id})">📄 Voir documents</button>`

        container.appendChild(div)
    }
    
}
    
