// services/email.service.ts

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getStorage } from "firebase-admin/storage";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import {
  getMatchById,
  updateSubscriptionDownloadUrl,
  updateTicketDownLoadUrl,
} from "@/services/ticket.service";
import { getAbonementById } from "@/services/abonement.service";

export async function generateAndSendTicketPDF(
  user,
  tickets,
  order,
  subscription
) {
  const bucket = getStorage().bucket();
  const logoPath = path.join(process.cwd(), "public", "logo-big.png");
  const logoBytes = fs.readFileSync(logoPath);

  let match = null;

  if (tickets.length > 0) {
    match = await getMatchById(tickets[0].matchId);

    const attachments = [];
    const downloadLinks = [];
    const formatDate = (timestamp) => {
      const milliseconds =
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;

      const date = new Date(milliseconds);

      const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
      const time = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDateShort = date.toLocaleDateString("fr-FR", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      return {
        dayName,
        date: formattedDateShort,
        time,
      };
    };

    const { dayName, date, time } = formatDate(match.date);
    for (const ticket of tickets) {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([500, 600]);

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const black = rgb(0, 0, 0);

      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, {
        x: 30,
        y: page.getHeight() - 130, // Adjusted for better positioning
        width: 150,
        height: 100,
      });

      const qrImage = await pdfDoc.embedPng(ticket.qrCodeImage);
      page.drawImage(qrImage, {
        x: page.getWidth() - 130, // Adjusted for better positioning
        y: page.getHeight() - 130,
        width: 100,
        height: 100,
      });

      const textStartY = page.getHeight() - 180; // Adjusted to start below the images
      const team1LogoImage = await pdfDoc.embedPng(logoBytes);
      const team2LogoResponse = await fetch(match.opponent.imageUrl);
      const team2LogoBuffer = await team2LogoResponse.arrayBuffer();
      const team2LogoImage = await pdfDoc.embedPng(team2LogoBuffer);

      const logosY = textStartY - 40; // Adjusted for better positioning below the QR code and logo
      const logosXCenter = page.getWidth() / 2;

      const logoWidth = 80;
      const logoHeight = 80;
      const spacing = 20; // Space between the logos

      page.drawImage(team1LogoImage, {
        x: logosXCenter - logoWidth - spacing / 2,
        y: logosY,
        width: logoWidth,
        height: logoHeight,
      });

      page.drawText("VS", {
        x: logosXCenter - 10, // Center the text between the two images
        y: logosY + logoHeight / 2 - 10, // Adjust to vertically center the text
        size: 24, // Big font size
        font,
        color: black,
      });

      page.drawImage(team2LogoImage, {
        x: logosXCenter + spacing / 2 + 12,
        y: logosY,
        width: logoWidth,
        height: logoHeight,
      });

      page.drawText(`Numéro du ticket : ${ticket.TicketCode}`, {
        x: 30,
        y: textStartY - 80, // Adjusted for better spacing
        size: 16,
        font,
        color: black,
      });

      page.drawText(`Nom et Prénom : ${user.userName}`, {
        x: 30,
        y: textStartY - 110, // Adjusted for better spacing
        size: 16,
        font,
        color: black,
      });

      page.drawText(`Billet pour : Megatoit vs ${match.opponent.name}`, {
        x: 30,
        y: textStartY - 140, // Adjusted for better spacing
        size: 16,
        font,
        color: black,
      });

      page.drawText(`Date : ${dayName} ${date} à ${time}`, {
        x: 30,
        y: textStartY - 170, // Adjusted for better spacing
        size: 14,
        font,
        color: black,
      });

      page.drawText(`Lieu : ${match.place}`, {
        x: 30,
        y: textStartY - 200, // Adjusted for better spacing
        size: 14,
        font,
        color: black,
      });

      const pdfBytes = await pdfDoc.save();
      const fileName = `tickets/${ticket.TicketCode}.pdf`;

      const file = bucket.file(fileName);
      await file.save(pdfBytes, {
        metadata: { contentType: "application/pdf" },
      });

      await file.makePublic(); // Optional: you can use signed URLs instead
      const downloadURL = file.publicUrl();
      downloadLinks.push(downloadURL);
      await updateTicketDownLoadUrl(ticket.TicketCode, downloadURL);

      // Prepare attachment
      attachments.push({
        filename: `ticket-${ticket.TicketCode}.pdf`,
        content: pdfBytes,
        contentType: "application/pdf",
      });
    }

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email with embedded logo and all ticket PDFs
    await transporter.sendMail({
      from: `"Billeterie Megatoit" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🎟 ${
        tickets.length > 1 ? "Vos tickets" : "Votre ticket"
      } pour le match Megatoit vs ${match.opponent.name}`,
      html: `
        <div style="text-align: center;">
            <img src="cid:logo" alt="Logo" style="width: 150px; height: auto;" />
        </div>
     
        <p style="text-align: center; font-weight: bold; font-size: 22px;">
            Commande confirmée !
        </p>

        <p style="text-align: center; font-size: 16px;">
            Nous avons le plaisir de vous confirmer votre commande <strong>N°${
              order.code
            }</strong>.
            Vous trouverez en pièces-jointes ${
              tickets.length > 1 ? "l'ensemble de vos tickets" : "votre ticket"
            } .
        </p>
    `,
      attachments: [
        ...attachments,
        {
          filename: "logo-big.png",
          content: logoBytes,
          cid: "logo", // Referenced in img src="cid:logo"
        },
      ],
    });
  }
  if (subscription) {
    const abonnement = await getAbonementById(subscription.abonnementId);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 300]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const black = rgb(0, 0, 0);

    const logoImage = await pdfDoc.embedPng(logoBytes);

    page.drawImage(logoImage, {
      x: 30,
      y: page.getHeight() - 130, // Adjusted for better positioning
      width: 150,
      height: 100,
    });

    const qrImage = await pdfDoc.embedPng(subscription.qrCodeImage);
    page.drawImage(qrImage, {
      x: page.getWidth() - 130, // Adjusted for better positioning
      y: page.getHeight() - 130,
      width: 100,
      height: 100,
    });

    const titleWithSeason = `${abonnement.data.title} (${abonnement.data.season})`;
    page.drawText(titleWithSeason, {
      x: page.getWidth() / 2 - font.widthOfTextAtSize(titleWithSeason, 24) / 2, // Center the text horizontally
      y: page.getHeight() - 200, // Adjusted for better positioning
      size: 24, // Big font size
      font,
      color: black,
      opacity: 1,
    });
    const pdfBytes = await pdfDoc.save();
    const fileName = `abonnements/${subscription.code}.pdf`;

    const file = bucket.file(fileName);
    await file.save(pdfBytes, {
      metadata: { contentType: "application/pdf" },
    });

    await file.makePublic();
    const downloadURL = file.publicUrl();
    await updateSubscriptionDownloadUrl(subscription.code, downloadURL);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email with embedded logo and all ticket PDFs
    await transporter.sendMail({
      from: `"Billeterie Megatoit" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🎟 Votre abonnement Megatoit pour la saison ${abonnement.data.season}`,
      html: `
        <div style="text-align: center;">
            <img src="cid:logo" alt="Logo" style="width: 150px; height: auto;" />
        </div>
     
        <p style="text-align: center; font-weight: bold; font-size: 22px;">
            Commande confirmée !
        </p>

        <p style="text-align: center; font-size: 16px;">
            Nous avons le plaisir de vous confirmer votre commande <strong>N°${order.code}</strong>.
            Vous trouverez en pièces-jointes votre abonnement.
        </p>
    `,
      attachments: [
        {
          filename: `abonnement-${subscription.code}.pdf`,
          content: pdfBytes,
          contentType: "application/pdf",
        },
        {
          filename: "logo-big.png",
          content: logoBytes,
          cid: "logo", // Referenced in img src="cid:logo"
        },
      ],
    }); // Optional: you can use signed URLs instead
  }

  return { success: true };
}
