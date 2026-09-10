import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getSeasonOfferEmailTemplate } from "@/utils/emailTemplate";

const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Billetterie BSR";
const mailFrom = () => `"${EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Vérification de sécurité avec le token
  if (!token || token !== process.env.SEASON_OFFER_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Démarrage du processus en arrière-plan
  processEmailsInBackground().catch((err) => {
    console.error("Erreur lors de l'envoi par lots :", err);
  });

  // On retourne 202 Accepted immédiatement pour ne pas bloquer le client
  // et pour éviter le timeout de la requête HTTP
  return NextResponse.json(
    { message: "L'envoi des e-mails a démarré en arrière-plan." },
    { status: 202 }
  );
}

async function processEmailsInBackground() {
  console.log("Démarrage de l'envoi des e-mails en lots...");
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "https://bsr3r.com";
  
  const port = Number(process.env.SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { minVersion: "TLSv1.2" },
  });

  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    // Garder uniquement les utilisateurs ayant un e-mail défini
    const validUsers = users.filter((u) => u.email);
    console.log(`${validUsers.length} utilisateurs trouvés avec un e-mail.`);

    const BATCH_SIZE = 50;
    
    for (let i = 0; i < validUsers.length; i += BATCH_SIZE) {
      const batch = validUsers.slice(i, i + BATCH_SIZE);
      console.log(`Traitement du lot ${Math.floor(i / BATCH_SIZE) + 1} sur ${Math.ceil(validUsers.length / BATCH_SIZE)}`);
      
      const emailPromises = batch.map((user) => {
        const userName = user.userName || user.firstName || "Cher Partisan";
        const htmlContent = getSeasonOfferEmailTemplate(userName, baseUrl);
        
        return transporter.sendMail({
          from: mailFrom(),
          to: user.email,
          subject: "BSR Hockey - Offre billet de saison",
          html: htmlContent,
        }).catch(err => {
          console.error(`Échec d'envoi à ${user.email}:`, err);
        });
      });

      await Promise.all(emailPromises);
      
      // Pause de 3 secondes entre chaque lot pour éviter d'être bloqué par le serveur SMTP
      if (i + BATCH_SIZE < validUsers.length) {
        await delay(3000); 
      }
    }
    
    console.log("L'envoi des e-mails est terminé avec succès.");
  } catch (error) {
    console.error("Erreur générale dans le traitement des e-mails:", error);
  }
}
