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
  try {
    const bucket = getStorage().bucket();
    const logoPath = path.join(process.cwd(), "public", "logo-big.png");
    const logoBytes = fs.readFileSync(logoPath);

    let match = null;

    if (tickets.length > 0) {
      console.log("Tickets found, generating PDFs for tickets...");
      match = await getMatchById(tickets[0].matchId);

      const attachments = [];
      const downloadLinks = [];
      const formatDate = (timestamp) => {
        const milliseconds =
          timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;

        const date = new Date(milliseconds);

        const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
        const str = new Intl.DateTimeFormat("fr-FR", {
          timeZone: "Etc/GMT-1", // ← freeze at UTC
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(date);

        return {
          dayName,
          date: str,
        };
      };

      const { dayName, date } = formatDate(match.date);
      for (const ticket of tickets) {
        console.log(`Generating PDF for ticket: ${ticket.TicketCode}`);
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 250]);
        const { width, height } = page.getSize();
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const team1Name = "Megatoit"; // ex. 'ÉQUIPE A'
        const team2Name = match.opponent.name; // ex. 'ÉQUIPE B'
        const headerSize = 24;
        const spacing = 8; // écart entre éléments
        const team1LogoImage = await pdfDoc.embedPng(logoBytes);
        const team2LogoResponse = await fetch(match.opponent.imageUrl);
        const team2LogoBuffer = await team2LogoResponse.arrayBuffer();
        const team2LogoImage = await pdfDoc.embedPng(team2LogoBuffer);

        // 1. Dimensions logos (hauteur = headerSize, on calcule largeur conservant ratio)
        const logoDesiredHeight = headerSize;
        const team1Dims = team1LogoImage.scale(
          logoDesiredHeight / team1LogoImage.height
        );
        const team2Dims = team2LogoImage.scale(
          logoDesiredHeight / team2LogoImage.height
        );

        // 2. Largeurs textes
        const team1TextWidth = fontBold.widthOfTextAtSize(
          team1Name,
          headerSize
        );
        const team2TextWidth = fontBold.widthOfTextAtSize(
          team2Name,
          headerSize
        );
        const vsText = " vs ";
        const vsWidth = fontBold.widthOfTextAtSize(vsText, headerSize);

        // 3. Largeur totale de l’en‑tête
        const totalWidth =
          team1Dims.width +
          spacing +
          team1TextWidth +
          spacing +
          vsWidth +
          spacing +
          team2TextWidth +
          spacing +
          team2Dims.width;

        // 4. Point de départ X pour centrer
        const startX = (width - totalWidth) / 2;
        const yPos = height - 40; // hauteur où on veut dessiner le header

        // 5. Dessin du logo 1
        page.drawImage(team1LogoImage, {
          x: startX,
          y: yPos - team1Dims.height / 2 + headerSize / 2,
          width: team1Dims.width,
          height: team1Dims.height,
        });

        // 6. Dessin du texte « ÉQUIPE A »
        let cursorX = startX + team1Dims.width + spacing;
        page.drawText(team1Name, {
          x: cursorX,
          y: yPos,
          size: headerSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // 7. Texte « vs »
        cursorX += team1TextWidth + spacing;
        page.drawText(vsText, {
          x: cursorX,
          y: yPos,
          size: headerSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // 8. Texte « ÉQUIPE B »
        cursorX += vsWidth + spacing;
        page.drawText(team2Name, {
          x: cursorX,
          y: yPos,
          size: headerSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // 9. Logo 2
        cursorX += team2TextWidth + spacing;
        page.drawImage(team2LogoImage, {
          x: cursorX,
          y: yPos - team2Dims.height / 2 + headerSize / 2,
          width: team2Dims.width,
          height: team2Dims.height,
        });

        // 2. Bordure extérieure
        const borderWidth = 2;
        page.drawRectangle({
          x: borderWidth / 2,
          y: borderWidth / 2,
          width: width - borderWidth,
          height: height - borderWidth,
          borderColor: rgb(0, 0, 0),
          borderWidth,
          color: rgb(1, 1, 1), // fond blanc
        });

        // 3. Fonts

        // 5. Ligne de séparation
        page.drawLine({
          start: { x: 20, y: height - 60 },
          end: { x: width - 20, y: height - 60 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        // 6. Infos du ticket
        let cursorY = height - 90;
        const infoSize = 14;
        page.drawText(`Ticket #${ticket.TicketCode}`, {
          x: 20,
          y: cursorY,
          size: infoSize,
          font: fontRegular,
        });
        cursorY -= 20;
        page.drawText(`${dayName} | ${date}`, {
          x: 20,
          y: cursorY,
          size: infoSize,
          font: fontBold,
        });
        cursorY -= 20;
        page.drawText(match.place, {
          x: 20,
          y: cursorY,
          size: infoSize,
          font: fontRegular,
        });

        const qrSize = 100;
        const qrImage = await pdfDoc.embedPng(ticket.qrCodeImage);
        page.drawImage(qrImage, {
          x: width - qrSize - 20,
          y: 20,
          width: qrSize,
          height: qrSize,
        });

        const pdfBytes = await pdfDoc.save();
        const fileName = `tickets/${ticket.TicketCode}.pdf`;

        const file = bucket.file(fileName);
        await file.save(pdfBytes, {
          metadata: { contentType: "application/pdf" },
        });
        console.log(`Ticket PDF saved for ${ticket.TicketCode} at ${fileName}`);

        await file.makePublic(); // Optional: you can use signed URLs instead
        const downloadURL = file.publicUrl();
        console.log(
          `Download URL for ticket ${ticket.TicketCode}:`,
          downloadURL
        );
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
        x:
          page.getWidth() / 2 - font.widthOfTextAtSize(titleWithSeason, 24) / 2, // Center the text horizontally
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
  } catch (error) {
    console.error("Error generating or sending PDF:", error);
    throw new Error("Failed to generate or send PDF");
  }
}
