import { after, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getOpeningMatchEmailTemplate } from "@/utils/openingMatchEmailTemplate";
import path from "node:path";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  if (!process.env.SEASON_OFFER_TOKEN || token !== process.env.SEASON_OFFER_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = emailParam?.trim();
  if (emailParam !== null && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ error: "Adresse e-mail invalide" }, { status: 400 });
  }

  after(() => processEmailsInBackground(email).catch((error) => {
    console.error("Erreur lors de l'envoi de l'offre du match d'ouverture :", error);
  }));

  return NextResponse.json(
    { message: email ? `L'envoi du courriel à ${email} a démarré.` : "L'envoi des courriels du match d'ouverture a démarré." },
    { status: 202 }
  );
}

async function processEmailsInBackground(targetEmail) {
  const port = Number(process.env.SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { minVersion: "TLSv1.2" },
  });

  let list;
  if (targetEmail) {
    list = [{ email: targetEmail, name: "cher partisan" }];
  } else {
    const snapshot = await getDocs(collection(db, "users"));
    const recipients = new Map();

    for (const doc of snapshot.docs) {
      const user = doc.data();
      const email = typeof user.email === "string" ? user.email.trim() : "";
      if (email && !recipients.has(email.toLowerCase())) {
        recipients.set(email.toLowerCase(), { email, name: user.userName || user.firstName || "cher partisan" });
      }
    }

    list = [...recipients.values()];
  }

  console.log(`${list.length} destinataires pour le match d'ouverture.`);

  for (let i = 0; i < list.length; i += 50) {
    const batch = list.slice(i, i + 50);
    await Promise.all(batch.map(async ({ email, name }) => {
      try {
        await transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME || "Billetterie BSR"}" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Match d'ouverture BSR le 25 septembre : 50 % de rabais",
          text: `Bonjour ${name},\n\nLe vendredi 25 septembre 2026 à 20 h, St-Lambert-de-Lauzon affronte le BSR Trois-Rivières pour le match d'ouverture.\n\nProfitez de 50 % de rabais avec le code promo BSR50 pour acheter votre billet : https://bsr3r.com/calendrier/ov2dS6VfPr7gWRd812sA`,
          html: getOpeningMatchEmailTemplate(name),
          attachments: [{
            filename: "St-Lambert-de-Lauzon.png",
            path: path.join(process.cwd(), "public", "St-Lambert-de-Lauzon.png"),
            cid: "st-lambert-logo",
          }],
        });
      } catch (error) {
        console.error(`Échec d'envoi à ${email}:`, error);
      }
    }));

    if (i + 50 < list.length) await delay(3000);
  }

  console.log("Envoi des courriels du match d'ouverture terminé.");
}
