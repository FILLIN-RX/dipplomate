import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }).promise()

    console.log('✅ Connecté à MySQL !');

  export  async function getstudents() {

  const result = await  pool.query("SELECT * FROM diplomate")
  const row = result[0]
  return row
   }
  export async function getstudent(id) {
    const result=  await pool.query(`SELECT *  FROM diplomate WHERE id = ?`, [id]
    )
    const rows = result[0]
    return rows
    
   }
  export async function createEtudiant(nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe) {
        const [result] = await pool.query(`
            INSERT INTO diplomate (nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe)
            VALUES (?,?,?,?,?,?,?)`,[nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe])
            const id = result.insertId
            return getstudent(id)
            
   }

   const notes = await getstudents()
    console.log(notes)
export  default pool;
