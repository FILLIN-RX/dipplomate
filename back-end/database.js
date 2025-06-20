import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

console.log("✅ Connecté à MySQL !");
////////////////////////////////////////////////////////

//fonction pour recuperer les etudiant de la base de donee

//////////////////////////////////////////////////////////

export async function getstudents() {
  const result = await pool.query("SELECT * FROM etudiants");
  const row = result[0];
  return row;
}
export async function getstudent(id) {
  const result = await pool.query(`SELECT *  FROM etudiants WHERE id = ?`, [
    id,
  ]);
  const rows = result[0];
  return rows;
}
/////////////////////////////////////////////////////////////////////////////////////

//fonction pour Obtenir les documents d’un étudiant avec leur état (fourni ou pas)

//////////////////////////////////////////////////////////////////////////////////
export async function getDocumentsEtudiant(etudiantId) {
  const [rows] = await pool.query(
    `
    SELECT d.id, d.nom_document, ed.fourni
    FROM documents d
    LEFT JOIN etudiants_documents ed 
      ON d.id = ed.document_id AND ed.etudiant_id = ?
  `,
    [etudiantId]
  );
  return rows;
}
//////////////////////////////////////////////////////////////////////////////////////

//fonction pour valider les document de un etudiant

/////////////////////////////////////////////////////////////////////////////////////

export async function setDocumentFourniture(etudiantId, documentId, fourni) {
  // Vérifie si l'entrée existe
  const [rows] = await pool.query(
    `
    SELECT * FROM etudiants_documents 
    WHERE etudiant_id = ? AND document_id = ?
  `,
    [etudiantId, documentId]
  );

  if (rows.length > 0) {
    // Mise à jour
    await pool.query(
      `
      UPDATE etudiants_documents 
      SET fourni = ? 
      WHERE etudiant_id = ? AND document_id = ?
    `,
      [fourni, etudiantId, documentId]
    );
  } else {
    // Insertion
    await pool.query(
      `
      INSERT INTO etudiants_documents (etudiant_id, document_id, fourni)
      VALUES (?, ?, ?)
    `,
      [etudiantId, documentId, fourni]
    );
  }

  return getDocumentsEtudiant(etudiantId);
}
////////////////////////////////////////////////////////////////////////////////////

//fonction pour ceer un etudiant

//////////////////////////////////////////////////////////////////////////////////////
export async function createEtudiant(
  nom,
  prenom,
  sexe,
  date_naissance,
  lieu_naissance,
  matricule,
  groupe
) {
  const [result] = await pool.query(
    `
            INSERT INTO etudiants (nom,prenom,sexe,date_naissance,lieu_naissance,matricule,groupe)
            VALUES (?,?,?,?,?,?,?)`,
    [nom, prenom, sexe, date_naissance, lieu_naissance, matricule, groupe]
  );
  const id = result.insertId;
  return getstudent(id);
}
/////////////////////////////////////////////////////////////////////////////

//fonction pour verifier si les dossie de un etudiant sont complet

////////////////////////////////////////////////////////////////////////////
export async function isDossierComplet(etudiantId) {
  const [totalDocs] = await pool.query(
    `SELECT COUNT(*) as total FROM documents`
  );
  const [fourniDocs] = await pool.query(
    `
    SELECT COUNT(*) as fourni FROM etudiants_documents 
    WHERE etudiant_id = ? AND fourni = 1
  `,
    [etudiantId]
  );

  return fourniDocs[0].fourni === totalDocs[0].total;
}
////////////////////////////////////////////////////////////////////////

//  fonction pour lister tout les 🔍 Étudiants avec dossiers complets

/////////////////////////////////////////////////////////////////////////
export async function getEtudiantsComplets() {
  const [rows] = await pool.query(`
    SELECT e.*
    FROM etudiants e
    WHERE (
      SELECT COUNT(*) FROM etudiants_documents ed
      WHERE ed.etudiant_id = e.id AND ed.fourni = 1
    ) = (
      SELECT COUNT(*) FROM documents
    )
  `);
  return rows;
}
/////////////////////////////////////////////////////////////////////////////

// fonction pour lister tout les 🔍 Étudiants avec dossiers incomplets

/////////////////////////////////////////////////////////////////////////////////
export async function getEtudiantsIncomplets() {
  const [rows] = await pool.query(`
    SELECT e.*
    FROM etudiants e
    WHERE (
      SELECT COUNT(*) FROM etudiants_documents ed
      WHERE ed.etudiant_id = e.id AND ed.fourni = 1
    ) < (
      SELECT COUNT(*) FROM documents
    )
  `);
  return rows;
}
///////////////////////////////////////////////////////////////////////////////////////////

//fonction pour supprimer un etudiand

////////////////////////////////////////////////////////////////////////////////////////////
export async function deleteEudiant(etudiantId) {
  await pool.query(
    `
    DELETE FROM etudiants_documents WHERE etudiant_id = ?`,
    [etudiantId]
  );
  const result = await pool.query(`DELETE FROM etudiants WHERE id = ?`, [
    etudiantId,
  ]);

  return result;
}

///////////////////////////////////////////////////////////////

//fonction pour modifier un etudiant

///////////////////////////////////////////////////////////////

export async function modifierEtudiant(
  id,
  nom,
  prenom,
  sexe,
  date_naissance,
  lieu_naissance,
  matricule,
  groupe
) {
 const [updated]= await pool.query(
    `UPDATE etudiants SET
    nom = ?,
    prenom = ?,
    sexe = ?,
    date_naissance = ?,
    lieu_naissance = ?,
    matricule = ?,
    groupe = ?
    WHERE id = ?`,
    [nom, prenom, sexe, date_naissance, lieu_naissance, matricule, groupe,id]
  );

  return updated
}
const notes = await getstudents();
console.log(notes);
export default pool;
