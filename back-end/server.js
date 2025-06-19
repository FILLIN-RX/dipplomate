import express, { json } from 'express'
import {getstudents,getstudent,createEtudiant} from './database.js'
const app = express()
app.use(express.json());
app.get("/etudiant" , async (req,res)=>{
    const Etudaint_datas = await getstudents()
    res.send(Etudaint_datas)
})
app.get("/etudiant/:id" , async (req,res)=>{
    const id = req.params.id
    const Etudaint_data = await getstudent(id)
    res.send(Etudaint_data)
})

app.post("/etudiant", async (req,res)=>{
    const { nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe} = req.body
    const etudiant = await createEtudiant(nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe)
    res.status(201).send(etudiant)
  
    
})
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})


app.listen(5000,()=>{
    console.log("server started at lcalhost 5000")
})