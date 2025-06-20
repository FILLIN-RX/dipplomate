const API = "http://localhost:5000"

document.addEventListener("DOMContentLoaded",()=>{
    chargerEtudiant()

    const form = document.getElementById("ajout-form")
    form.addEventListener("submit",async (e) => {
        e.preventDefault();
         const data = Object.fromEntries(new FormData(form).entries())
         await fetch(`${API}/etudiant`,{
            method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify(data)
         })
         
         form.reset()
         chargerEtudiant()
    })


}) 

async function chargerEtudiant() {
    const container = document.getElementById("etudiants-container")
    container.innerHTML = "chargement..."
    const res = await fetch(`${API}/etudiant`)
    const etudiants = await res.json()
    container.innerHTML = ""
    for (let e of etudiants) {

        //verifie si etudiant est complet

        const res2 = await fetch(`${API}/etudiant/${e.id}/complet`)
        const status = await res2.json()
        const div = document.createElement("div")
        div.className ="etudiant"

        div.innerHTML = ` <strong>${e.nom} ${e.prenom} - ${status.dossierComplet ? '<span class=complet>Dossier complet</span>':'<span class="incomplet">Dossier Incomplet</span>'}</strong>  <button onclick="voirDocuments(${e.id})">📄 Voir documents</button>
        <div id="docs-${e.id}"></div>`

        container.appendChild(div)
    }

    
}
async function voirDocuments(etudiantId){
    const container = document.getElementById(`docs-${etudiantId}`)
    container.innerHTML ="chargement....."

    const res = await fetch(`${API}/etudiant/${etudiantId}/documents`)
    const docs = await res.json()
    container.innerHTML= ""

    container.innerHTML = docs.map(d=>`
        <div>
            <label>
                <input 
                    type="checkbox"
                     ${d.fourni ? "checked" : ""}
                     onchange="majFourniture(${etudiantId},${d.id}, this.checked)"
                />
            ${d.nom_document} 
            </label>
        </div>`).join("")

}
async function majFourniture(etudiantId,documentId,isChecked) {
    await fetch(`${API}/etudiant/${etudiantId}/documents/${documentId}`,{
        method:"POST",
        headers :{"Content-Type":"application/json"},
        body: JSON.stringify({fourni: isChecked})

        //Recharge les etudiant pour mettre ajour leur status

    })
    chargerEtudiant()
    
}