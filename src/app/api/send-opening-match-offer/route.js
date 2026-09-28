import { after, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  BEDFORD_DATE,
  MATCH_URL,
  PROMO_CODE,
  VALLEYFIELD_DATE,
  getFreeTicketOfferEmailTemplate,
} from "@/utils/freeTicketOfferEmailTemplate";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getUserName = (user) => [user.userName, user.firstName]
  .find((value) => typeof value === "string" && value.trim())?.trim() || "";

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

  if (!BEDFORD_DATE || MATCH_URL === "https://bsr3r.com/calendrier") {
    return NextResponse.json(
      { error: "Gabarit incomplet : date du match Bedford-Cowansville ou lien du match manquant" },
      { status: 500 }
    );
  }

  after(() => processEmailsInBackground(email).catch((error) => {
    console.error("Erreur lors de l'envoi de l'offre billets offerts :", error);
  }));

  return NextResponse.json(
    { message: email ? `L'envoi du courriel à ${email} a démarré.` : "L'envoi des courriels de l'offre billets offerts a démarré." },
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
    const userQuery = query(collection(db, "users"), where("email", "==", targetEmail), limit(1));
    const userSnapshot = await getDocs(userQuery);
    const user = userSnapshot.docs[0]?.data();
    list = [{ email: targetEmail, name: user ? getUserName(user) : "" }];
  } else {
    const snapshot = await getDocs(collection(db, "users"));
    list = snapshot.docs.flatMap((doc) => {
      const user = doc.data();
      const email = typeof user.email === "string" ? user.email.trim() : "";
      return email ? [{ email, name: getUserName(user) }] : [];
    });
  }

  console.log(`${list.length} destinataires pour l'offre billets offerts.`);

  for (let i = 0; i < list.length; i += 50) {
    const batch = list.slice(i, i + 50);
    await Promise.all(batch.map(async ({ email, name }) => {
      try {
        await transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME || "Billetterie BSR"}" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Valleyfield vs Trois-Rivières : 1 billet acheté = 1 billet offert avec ${PROMO_CODE}`,
          text: `Bonjour${name ? ` ${name}` : ""},\n\nOFFRE SPÉCIALE — Valleyfield vs Trois-Rivières, ${VALLEYFIELD_DATE}.\n\nAchetez vos billets pour ce match avec le code promo ${PROMO_CODE} et recevez automatiquement le même nombre de billets gratuits pour le match suivant à domicile : Bedford-Cowansville vs Trois-Rivières, ${BEDFORD_DATE}.\n\nExemple : 2 billets achetés pour Valleyfield = 2 billets offerts pour Bedford-Cowansville.\n\nAchetez vos billets : ${MATCH_URL}`,
          html: getFreeTicketOfferEmailTemplate(name),
        });
      } catch (error) {
        console.error(`Échec d'envoi à ${email}:`, error);
      }
    }));

    if (i + 50 < list.length) await delay(3000);
  }

  console.log("Envoi des courriels de l'offre billets offerts terminé.");
}
