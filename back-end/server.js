import express, { json } from 'express'
import {getstudents,getstudent,createEtudiant ,getDocumentsEtudiant,isDossierComplet,setDocumentFourniture,getEtudiantsComplets,getEtudiantsIncomplets} from './database.js'



const app = express()
app.use(express.json());
app.get("/etudiant" , async (req,res)=>{
    const Etudaint_datas = await getstudents()
    res.send(Etudaint_datas)
})
// 🟢 Étudiants avec dossiers complets
app.get("/etudiants/complets", async (req, res) => {
  try {
    const data = await getEtudiantsComplets()
    res.send(data)
  } catch (e) {
    res.status(500).send("Erreur lors de la récupération des étudiants complets")
  }
})

// 🔴 Étudiants avec dossiers incomplets
app.get("/etudiants/incomplets", async (req, res) => {
  try {
    const data = await getEtudiantsIncomplets()
    res.send(data)
  } catch (e) {
    res.status(500).send("Erreur lors de la récupération des étudiants incomplets")
  }
})

app.get("/etudiant/:id" , async (req,res)=>{
    const id = req.params.id
    const Etudaint_data = await getstudent(id)
    res.send(Etudaint_data)
})
app.get("/etudiant/:id/documents", async (req, res) => {
  const id = req.params.id
  try {
    const documents = await getDocumentsEtudiant(id)
    res.send(documents)
  } catch (err) {
    res.status(500).send("Erreur lors de la récupération des documents")
  }
})
app.post("/etudiant", async (req,res)=>{
    const { nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe} = req.body
    const etudiant = await createEtudiant(nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe)
    res.status(201).send(etudiant)
  
    
})

app.post("/etudiant/:id/documents/:docId", async (req, res) => {
  const etudiantId = req.params.id
  const documentId = req.params.docId
  const { fourni } = req.body  // true ou false

  try {
    const updated = await setDocumentFourniture(etudiantId, documentId, fourni)
    res.send(updated)
  } catch (err) {
    res.status(500).send("Erreur lors de la mise à jour du document")
  }
})


app.get("/etudiant/:id/complet", async (req, res) => {
  const id = req.params.id
  try {
    const complet = await isDossierComplet(id)
    res.send({ id, dossierComplet: complet })
  } catch (err) {
    res.status(500).send("Erreur lors de la vérification du dossier")
  }
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})


app.listen(5000,()=>{
    console.log("server started at lcalhost 5000")
})