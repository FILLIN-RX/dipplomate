import express, { json } from 'express'
import {getstudents,getstudent,createEtudiant ,getDocumentsEtudiant,isDossierComplet,setDocumentFourniture,getEtudiantsComplets,getEtudiantsIncomplets,deleteEudiant,modifierEtudiant} from './database.js'
import  cors from 'cors';



const app = express()
app.use(cors());
app.use(express.json())
//////////////////////////////////////
//route pour liste tout les etudiant
/////////////////////////////////////
app.get("/etudiant" , async (req,res)=>{
    const Etudaint_datas = await getstudents()
    res.send(Etudaint_datas)
})
///////////////////////////////////////////
// route pour Étudiants avec dossiers complets
///////////////////////////////////////////////////
app.get("/etudiants/complets", async (req, res) => {
  try {
    const data = await getEtudiantsComplets()
    res.send(data)
  } catch (e) {
    res.status(500).send("Erreur lors de la récupération des étudiants complets")
  }
})
////////////////////////////////////////////////////////////////
// route pour Étudiants avec dossiers incomplets
///////////////////////////////////////////////////////////////
app.get("/etudiants/incomplets", async (req, res) => {
  try {
    const data = await getEtudiantsIncomplets()
    res.send(data)
  } catch (e) {
    res.status(500).send("Erreur lors de la récupération des étudiants incomplets")
  }
})
///////////////////////////////////////////////////////////////////////
//route pour ontenir un etudiant specific
//////////////////////////////////////////////////////////////////////////
app.get("/etudiant/:id" , async (req,res)=>{
    const id = req.params.id
    const Etudaint_data = await getstudent(id)
    res.send(Etudaint_data)
})
////////////////////////////////////////////////////////////////////////////
//route pour obtenir les document de un etudiant specific
//////////////////////////////////////////////////////////////////////////
app.get("/etudiant/:id/documents", async (req, res) => {
  const id = req.params.id
  try {
    const documents = await getDocumentsEtudiant(id)
    res.send(documents)
  } catch (err) {
    res.status(500).send("Erreur lors de la récupération des documents")
  }
})
////////////////////////////////////////////////////////////////////////////
//route pour creer un etudiant
///////////////////////////////////////////////////////////////////////////
app.post("/etudiant", async (req,res)=>{
    const { nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe} = req.body
    const etudiant = await createEtudiant(nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe)
    res.status(201).send(etudiant)
  
    
})
//////////////////////////////////////////////////////////////////////
// route pour valider les document de un etudiant ou  cocher les document de un etudiant
app.post("/etudiant/:id/documents/:docId", async (req, res) => {
  const etudiantId = req.params.id
  const documentId = req.params.docId
  const { fourni } = req.body  // true ou false
     console.log("🟢 Requête reçue :", {
    etudiantId,
    documentId,
    fourni,
    body: req.body,
  })
  try {
    const updated = await setDocumentFourniture(etudiantId, documentId, fourni)
    res.send(updated)
  } catch (err) {
     console.error("❌ Erreur majFourniture :", err)
    res.status(500).send("Erreur lors de la mise à jour du document")
  }
})

/////////////////////////////////////////////////////////////////
//Route pour verifier si un seule etudiant est complet
//////////////////////////////////////////////////////////////
app.get("/etudiant/:id/complet", async (req, res) => {
  const id = req.params.id
  try {
    const complet = await isDossierComplet(id)
    res.send({ id, dossierComplet: complet })
  } catch (err) {
    res.status(500).send("Erreur lors de la vérification du dossier")
  }
})
////////////////////////////////////////////////////////////
//route pour supprimer un etudiant
/////////////////////////////////////////////////////////////
app.delete("/etudiant/:id",async (req,res)=>{
    const id = req.params.id
    try {
        const supprimer = await deleteEudiant(id)
        res.send()
    } catch (error) {
        res.status(500).send("Erreur lors de la suppression de l'etudiant")  
    }
})
///////////////////////////////////////////////////////////////
// route pour modifier un etudiant
//////////////////////////////////////////////////////////////
app.put("/etudiant/:id", async (req,res)=>{
    const id  = req.params.id
    const { nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe} = req.body
    try{
      await modifierEtudiant(id,nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe)
      const updated = await getstudent(id)

    res.status(201).send(updated)
    }catch(err){
        console.error("Erreur de modification:" ,err)
        res.status(500).send("Erreur lors de la modification de l'etudiant")
    }
})
//////////////////////////////////////////////////////////////
//middleware d'erreur
/////////////////////////////////////////////////////////////
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})


app.listen(5000,()=>{
    console.log("server started at lcalhost 5000")
})