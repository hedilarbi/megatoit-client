// Prévient par e-mail les détenteurs de billets d'un match que l'heure indiquée sur leurs billets
// était erronée, et leur rappelle les bonnes heures (heure du Québec) des matchs annoncés.
//
// Par défaut : aucun envoi, affiche seulement les matchs et les destinataires.
//   node scripts/notify-match-time.mjs            -> simulation
//   node scripts/notify-match-time.mjs --send     -> envoi (après confirmation)
// Destinataires : détenteurs de billets (payés ou offerts) du match du jour RECIPIENT_DAY.
// Matchs annoncés dans l'e-mail : un par jour de ANNOUNCED_DAYS (ou --matches id1,id2).
// À lancer depuis le dossier megatoit-client (lit .env.local comme l'application).

import path from "path";
import fs from "fs";
import readline from "readline";
import { fileURLToPath } from "url";
import nextEnv from "@next/env";
import admin from "firebase-admin";
import nodemailer from "nodemailer";

const RECIPIENT_DAY = "2026-10-02";
const ANNOUNCED_DAYS = ["2026-10-02", "2026-10-03"];
const TZ = "America/Toronto";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(appDir);

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : null;
};
const send = args.includes("--send");

const ask = (question) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a); }));
};
const mask = (email) => email.replace(/^(.)[^@]*(@.*)$/, "$1***$2");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS)) });
const db = admin.firestore();

// Le match d'une journée, à l'heure du Québec (minuit EDT = 04:00 UTC)
const findMatchOnDay = async (day) => {
  const start = new Date(`${day}T04:00:00Z`);
  const end = new Date(start.getTime() + 24 * 3600 * 1000);
  const snap = await db.collection("matchs")
    .where("date", ">=", admin.firestore.Timestamp.fromDate(start))
    .where("date", "<", admin.firestore.Timestamp.fromDate(end))
    .get();
  if (snap.size !== 1) {
    console.log(`${snap.size} match(s) trouvé(s) le ${day} :`);
    for (const d of snap.docs) console.log(`  ${d.id}  ${d.data().opponent?.name || ""}  ${d.data().date.toDate().toISOString()}`);
    console.log("Relance avec --matches <id du 2 oct>,<id du 3 oct> pour choisir.");
    process.exit(1);
  }
  return snap.docs[0];
};

const describe = (doc) => {
  const m = doc.data();
  const date = m.date.toDate();
  const homeName = m.homeTeam?.name || "BSR DE TROIS-RIVIERES";
  const opponentName = m.opponent?.name || "Adversaire";
  return {
    id: doc.id,
    teams: m.type === "Domicile" ? `${opponentName} vs ${homeName}` : `${homeName} vs ${opponentName}`,
    dateLabel: date.toLocaleDateString("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    hourLabel: date.toLocaleTimeString("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).replace(":00", " h").replace(":", " h "),
  };
};

// 1. Les matchs
const matchIdsArg = argValue("--matches");
const matchDocs = [];
if (matchIdsArg) {
  for (const id of matchIdsArg.split(",").map((s) => s.trim()).filter(Boolean)) {
    const doc = await db.collection("matchs").doc(id).get();
    if (!doc.exists) throw new Error(`Match introuvable : ${id}`);
    matchDocs.push(doc);
  }
} else {
  for (const day of ANNOUNCED_DAYS) matchDocs.push(await findMatchOnDay(day));
}
const matches = matchDocs.map(describe);
const recipientMatch = matches[0]; // les destinataires sont les acheteurs du premier match

console.log("Matchs annoncés dans l'e-mail (vérifie les heures) :");
for (const m of matches) console.log(`  ${m.dateLabel} à ${m.hourLabel}  —  ${m.teams}  (${m.id})`);
console.log(`\nDestinataires : détenteurs de billets du match du ${recipientMatch.dateLabel} (${recipientMatch.id})`);

// 2. Les détenteurs de billets (payés et offerts) du premier match
const ticketsSnap = await db.collection("tickets").where("matchId", "==", recipientMatch.id).get();
const userIds = [...new Set(ticketsSnap.docs.map((d) => d.data().userId).filter(Boolean))];

const recipients = new Map(); // email -> nom
const missing = [];
for (let i = 0; i < userIds.length; i += 100) {
  const refs = userIds.slice(i, i + 100).map((id) => db.collection("users").doc(id));
  const docs = await db.getAll(...refs);
  for (const doc of docs) {
    const email = String(doc.data()?.email || "").trim().toLowerCase();
    if (!email) { missing.push(doc.id); continue; }
    if (!recipients.has(email)) recipients.set(email, doc.data()?.userName || "");
  }
}

console.log(`  Billets : ${ticketsSnap.size}`);
console.log(`  Acheteurs : ${userIds.length}`);
console.log(`  Adresses e-mail distinctes : ${recipients.size}`);
if (missing.length) console.log(`  Comptes sans e-mail (ignorés) : ${missing.length}`);
console.log("  Exemples :", [...recipients.keys()].slice(0, 5).map(mask).join(", "));

// 3. Le message
const shortDay = (m) => m.dateLabel.replace(/ \d{4}$/, "");
const subject = `Heures des matchs : ${matches.map((m) => `${shortDay(m)} à ${m.hourLabel}`).join(" et ")}`;
const listHtml = matches
  .map((m) => `<li style="margin-bottom:8px"><strong>${m.dateLabel} à ${m.hourLabel}</strong><br />${m.teams}</li>`)
  .join("");
const listText = matches.map((m) => `- ${m.dateLabel} à ${m.hourLabel} : ${m.teams}`).join("\n");
const html = (name) => `
  <div style="text-align:center">
    <img src="cid:logo-big" alt="BSR DE TROIS-RIVIÈRES" style="width:150px;height:auto" />
  </div>
  <p style="font-size:16px">Bonjour${name ? ` ${name}` : ""},</p>
  <p style="font-size:16px">Une erreur technique a fait afficher une mauvaise heure sur certains billets envoyés récemment. Voici les bonnes heures (heure du Québec) :</p>
  <ul style="font-size:16px">${listHtml}</ul>
  <p style="font-size:16px">Vos billets restent entièrement valides : présentez-les comme d'habitude à l'entrée.</p>
  <p style="font-size:16px">Toutes nos excuses pour la confusion. Au plaisir de vous voir au match !</p>
  <p style="font-size:16px">L'équipe du BSR de Trois-Rivières</p>`;
const text = (name) =>
  `Bonjour${name ? ` ${name}` : ""},\n\nUne erreur technique a fait afficher une mauvaise heure sur certains billets envoyés récemment. Voici les bonnes heures (heure du Québec) :\n\n${listText}\n\nVos billets restent entièrement valides : présentez-les comme d'habitude à l'entrée.\n\nToutes nos excuses pour la confusion. Au plaisir de vous voir au match !\n\nL'équipe du BSR de Trois-Rivières`;

console.log(`\nObjet : ${subject}`);
console.log(`\n--- Aperçu ---\n${text("[nom]")}\n--------------`);

if (!send) {
  console.log("\nSimulation : aucun e-mail envoyé. Relance avec --send pour envoyer.");
  process.exit(0);
}

// 4. Envoi, avec reprise possible : les adresses déjà servies sont notées dans un fichier
const sentFile = path.join(appDir, `scripts/notify-sent-${matches.map((m) => m.id).join("-")}.json`);
const alreadySent = new Set(fs.existsSync(sentFile) ? JSON.parse(fs.readFileSync(sentFile, "utf8")) : []);
const todo = [...recipients.entries()].filter(([email]) => !alreadySent.has(email));
if (alreadySent.size) console.log(`Déjà envoyés lors d'un lancement précédent : ${alreadySent.size}`);
if (!todo.length) {
  console.log("Tout le monde a déjà reçu le message.");
  process.exit(0);
}

const answer = await ask(`\nEnvoyer à ${todo.length} adresses ? Tape ${todo.length} puis Entrée (autre chose = annuler) : `);
if (answer.trim() !== String(todo.length)) {
  console.log("Annulé, aucun e-mail envoyé.");
  process.exit(0);
}

const port = Number(process.env.SMTP_PORT) || 465;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465,
  requireTLS: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { minVersion: "TLSv1.2" },
});
const from = `"${process.env.EMAIL_FROM_NAME || "Billetterie BSR"}" <${process.env.EMAIL_USER}>`;

let ok = 0;
const failed = [];
for (const [email, name] of todo) {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject,
      text: text(name),
      html: html(name),
      envelope: { from: process.env.EMAIL_USER, to: email },
      attachments: [{ filename: "logo-big.jpeg", path: path.join(appDir, "public", "logo-big.jpeg"), cid: "logo-big" }],
    });
    ok += 1;
    alreadySent.add(email);
    fs.writeFileSync(sentFile, JSON.stringify([...alreadySent]));
    process.stdout.write(`\r  Envoyés : ${ok}/${todo.length}   `);
  } catch (error) {
    failed.push(`${mask(email)} : ${error.message}`);
  }
  await sleep(300); // évite d'être limité par le serveur SMTP
}

console.log(`\n\nEnvoyés : ${ok}/${todo.length}`);
if (failed.length) console.log(`Échecs (relance la même commande pour réessayer) :\n  ${failed.join("\n  ")}`);
process.exit(0);
