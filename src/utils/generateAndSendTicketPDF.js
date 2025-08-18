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
      match = await getMatchById(tickets[0].matchId);

      const attachments = [];
      const downloadLinks = [];

      const formatDate = (timestamp) => {
        const ms = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
        const date = new Date(ms);
        const dayName = date.toLocaleDateString("fr-FR", {
          weekday: "long",
        });
        const str = new Intl.DateTimeFormat("fr-FR", {
          timeZone: "Etc/GMT-1",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(date);
        return { dayName, date: str };
      };

      const { dayName, date } = formatDate(match.date);

      for (const ticket of tickets) {
        // … dans votre boucle for (const ticket of tickets) { …
        const userName = user.userName;
        // 1) création du document et de la page
        const pdfDoc = await PDFDocument.create();
        // page plus large pour passer le QR à droite
        const page = pdfDoc.addPage([800, 300]);
        const { width, height } = page.getSize();

        // 2) fonts
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // 3) données
        const team1Name = "Mégatoit";
        const team2Name = match.opponent.name;

        const placeText = match.place;
        const ticketCode = ticket.TicketCode;

        // 4) embeds
        const logoBytes = fs.readFileSync(logoPath);
        const team1LogoImage = await pdfDoc.embedPng(logoBytes);
        const team2LogoBuffer = await (
          await fetch(match.opponent.imageUrl)
        ).arrayBuffer();
        const team2LogoImage = await pdfDoc.embedPng(team2LogoBuffer);
        const qrImage = await pdfDoc.embedPng(ticket.qrCodeImage);

        // 5) régions et dimensions
        const margin = 20;
        const qrSize = 200;
        const separatorX = width - qrSize - margin - 30; // x de la ligne de séparation verticale
        const leftWidth = separatorX - 2 * margin; // largeur dispo à gauche du QR

        const borderWidth = 20; // épaisseur de la bordure

        page.drawRectangle({
          x: borderWidth / 2,
          y: borderWidth / 2,
          width: width - borderWidth,
          height: height - borderWidth,
          color: rgb(1, 1, 1),
          borderColor: rgb(0, 0, 0),
          borderWidth,
        });

        // 6) Draw QR + séparation
        page.drawLine({
          start: { x: separatorX, y: margin },
          end: { x: separatorX, y: height - margin },
          thickness: 2,
          color: rgb(0, 0, 0),
        });
        page.drawImage(qrImage, {
          x: separatorX + margin,
          y: height - qrSize - margin - 30,
          width: qrSize,
          height: qrSize,
        });

        // 7) Title tout en haut
        // 7) Titre à gauche + userName à droite (sur la même ligne)
        const title = `Billet N ${ticketCode}`;
        const titleSize = 28;

        const userText = String(userName || "");
        let userSize = 24; // taille du userName (gras)
        const minUserSize = 12; // taille min si ça ne rentre pas

        const titleY = height - 60;
        const titleLeftX = margin + 20;
        const gapMin = 40; // espace minimal entre le titre et le userName

        const titleW = fontBold.widthOfTextAtSize(title, titleSize);

        // Limite droite de la colonne gauche (avant la séparation / QR)
        const rightBound = separatorX - margin;

        // Largeur du userName à la taille initiale
        let userW = fontBold.widthOfTextAtSize(userText, userSize);

        // Position droite par défaut (aligné à droite)
        let userX = rightBound - userW;

        // Respecter l’espace minimal entre les deux textes
        if (userX < titleLeftX + titleW + gapMin) {
          userX = titleLeftX + titleW + gapMin;
        }

        // Si ça déborde encore, réduire la taille du userName progressivement
        while (userX + userW > rightBound && userSize > minUserSize) {
          userSize -= 1;
          userW = fontBold.widthOfTextAtSize(userText, userSize);
          userX = Math.max(titleLeftX + titleW + gapMin, rightBound - userW);
        }

        // Dessin du titre (gauche)
        page.drawText(title, {
          x: titleLeftX,
          y: titleY,
          size: titleSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Dessin du userName (droite, en gras)
        page.drawText(userText, {
          x: userX,
          y: titleY,
          size: userSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // 8) Ligne horizontale supérieure
        page.drawLine({
          start: { x: margin + 20, y: height - 80 },
          end: { x: separatorX - margin, y: height - 80 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        // 9) Header logos + « VS »
        const logoH = 70; // hauteur des logos
        const spacing = 8;
        const headerSize = 24;
        const team1Dims = team1LogoImage.scale(logoH / team1LogoImage.height);
        const team2Dims = team2LogoImage.scale(logoH / team2LogoImage.height);
        const vsText = " VS ";
        const team1W = fontBold.widthOfTextAtSize(team1Name, headerSize);
        const team2W = fontBold.widthOfTextAtSize(team2Name, headerSize);
        const vsW = fontBold.widthOfTextAtSize(vsText, headerSize);
        const totalHeader =
          team1Dims.width +
          spacing +
          team1W +
          spacing +
          vsW +
          spacing +
          team2W +
          spacing +
          team2Dims.width;
        const startX = (leftWidth - totalHeader) / 2 + margin;
        const headerY = height - 160;

        // logo 1
        page.drawImage(team1LogoImage, {
          x: startX,
          y: headerY - team1Dims.height / 2 + headerSize / 2,
          width: team1Dims.width,
          height: team1Dims.height,
        });
        // texte « Megatoit »
        let cursorX = startX + team1Dims.width + spacing;
        page.drawText(team1Name, {
          x: cursorX,
          y: headerY,
          size: headerSize,
          font: fontBold,
        });
        // texte « VS »
        cursorX += team1W + spacing;
        page.drawText(vsText, {
          x: cursorX,
          y: headerY,
          size: headerSize,
          font: fontBold,
        });
        // texte « Opponent »
        cursorX += vsW + spacing;
        page.drawText(team2Name, {
          x: cursorX,
          y: headerY,
          size: headerSize,
          font: fontBold,
        });
        // logo 2
        cursorX += team2W + spacing;
        page.drawImage(team2LogoImage, {
          x: cursorX,
          y: headerY - team2Dims.height / 2 + headerSize / 2,
          width: team2Dims.width,
          height: team2Dims.height,
        });

        // 10) Texte du lieu
        const placeSize = 16;
        const placeW = fontRegular.widthOfTextAtSize(placeText, placeSize);
        const placeY = headerY - logoH + 30; // 20px sous le header
        page.drawText(placeText, {
          x: (leftWidth - placeW) / 2 + margin,
          y: placeY,
          size: placeSize,
          font: fontRegular,
        });

        // 11) Ligne horizontale inférieure

        page.drawLine({
          start: { x: margin + 20, y: 70 },
          end: { x: separatorX - margin, y: 70 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        // 12) Date en bas
        const dateText = `${dayName.toUpperCase()}, ${date.toUpperCase()}`;
        const dateSize = 18;
        const dateW = fontBold.widthOfTextAtSize(dateText, dateSize);
        const dateY = 40;
        page.drawText(dateText, {
          x: (leftWidth - dateW) / 2 + margin,
          y: dateY,
          size: dateSize,
          font: fontBold,
        });

        // … ensuite sauvegarde, upload et envoi email comme avant …

        // Save & upload
        const pdfBytes = await pdfDoc.save();
        const fileName = `tickets/${ticket.TicketCode}.pdf`;
        const file = bucket.file(fileName);
        await file.save(pdfBytes, {
          metadata: { contentType: "application/pdf" },
        });
        await file.makePublic();
        const downloadURL = file.publicUrl();
        downloadLinks.push(downloadURL);
        await updateTicketDownLoadUrl(ticket.TicketCode, downloadURL);

        // Add to email attachments
        attachments.push({
          filename: `billet-${ticket.TicketCode}.pdf`,
          content: pdfBytes,
          contentType: "application/pdf",
        });
      }

      const port = Number(process.env.SMTP_PORT) || 465;
      const secure = port === 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        requireTLS: !secure, // impose STARTTLS si port 587
        tls: { minVersion: "TLSv1.2" }, // bonne pratique
      });

      await transporter.sendMail({
        from: `"Billetterie Mégatoit" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🎟 ${
          tickets.length > 1 ? "Vos billets" : "Votre billet"
        } pour le match Mégatoit vs ${match.opponent.name}`,
        html: `
          <div style="text-align:center">
            <img src="cid:logo" alt="Logo" style="width:150px;height:auto" />
          </div>
          <p style="text-align:center;font-weight:bold;font-size:22px">
            Commande confirmée !
          </p>
          <p style="text-align:center;font-size:16px">
            Votre commande <strong>№${order.code}</strong> est confirmée.
            Vous trouverez en pièce jointe ${
              tickets.length > 1 ? "vos billets" : "votre billet"
            }.
          </p>
        `,
        attachments: [
          ...attachments,
          {
            filename: "logo-big.png",
            content: logoBytes,
            cid: "logo",
          },
        ],
      });
    }

    // Subscription PDF (unchanged except logo size/position)
    if (subscription) {
      const abonnement = await getAbonementById(subscription.abonnementId);

      const pdfDoc = await PDFDocument.create();
      // page plus large pour passer le QR à droite
      const page = pdfDoc.addPage([800, 300]);
      const { width, height } = page.getSize();

      // 2) fonts

      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // 3) données

      const ticketCode = subscription.code;

      // 4) embeds
      const logoBytes = fs.readFileSync(logoPath);
      const team1LogoImage = await pdfDoc.embedPng(logoBytes);
      const qrImage = await pdfDoc.embedPng(subscription.qrCodeImage);

      const titleWithSeason = `${abonnement.data.title} (${abonnement.data.season})`;

      // 5) régions et dimensions
      const margin = 20;
      const qrSize = 200;
      const separatorX = width - qrSize - margin - 30; // x de la ligne de séparation verticale
      const leftWidth = separatorX - 2 * margin; // largeur dispo à gauche du QR

      const borderWidth = 20; // épaisseur de la bordure

      page.drawRectangle({
        x: borderWidth / 2,
        y: borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
        color: rgb(1, 1, 1),
        borderColor: rgb(0, 0, 0),
        borderWidth,
      });

      // 6) Draw QR + séparation
      page.drawLine({
        start: { x: separatorX, y: margin },
        end: { x: separatorX, y: height - margin },
        thickness: 2,
        color: rgb(0, 0, 0),
      });
      page.drawImage(qrImage, {
        x: separatorX + margin,
        y: height - qrSize - margin - 30,
        width: qrSize,
        height: qrSize,
      });

      // 7) Title tout en haut
      // 7) Titre "Abonnement N ..." à gauche + userName en gras à droite
      {
        const title = `Abonnement N ${ticketCode}`;
        const titleSize = 28;

        const userText = String(userName || "");
        let userSize = 24; // taille du userName (gras)
        const minUserSize = 12; // taille min si ça ne rentre pas

        const titleY = height - 60;
        const titleLeftX = margin + 20;
        const gapMin = 40; // espace minimal entre le titre et le userName

        const titleW = fontBold.widthOfTextAtSize(title, titleSize);

        // Limite droite de la colonne gauche (avant la séparation / QR)
        const rightBound = separatorX - margin;

        // Largeur/position du userName
        let userW = fontBold.widthOfTextAtSize(userText, userSize);
        let userX = rightBound - userW;

        // Respecter l’espace minimal entre les deux textes
        if (userX < titleLeftX + titleW + gapMin) {
          userX = titleLeftX + titleW + gapMin;
        }

        // Si ça déborde encore, réduire la taille du userName
        while (userX + userW > rightBound && userSize > minUserSize) {
          userSize -= 1;
          userW = fontBold.widthOfTextAtSize(userText, userSize);
          userX = Math.max(titleLeftX + titleW + gapMin, rightBound - userW);
        }

        // Dessin du titre (gauche)
        page.drawText(title, {
          x: titleLeftX,
          y: titleY,
          size: titleSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Dessin du userName (droite, en gras)
        page.drawText(userText, {
          x: userX,
          y: titleY,
          size: userSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
      }

      // 8) Ligne horizontale supérieure
      page.drawLine({
        start: { x: margin + 20, y: height - 80 },
        end: { x: separatorX - margin, y: height - 80 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      //i want i the center of the pdf add the logo of megatoit
      const logoH = 120; // hauteur du logo
      const logoDims = team1LogoImage.scale(logoH / team1LogoImage.height);
      const logoX = (leftWidth - logoDims.width) / 2 + margin;
      const logoY = height - 160;
      page.drawImage(team1LogoImage, {
        x: logoX,
        y: logoY - logoDims.height / 2 + titleSize / 2,
        width: logoDims.width,
        height: logoDims.height,
      });

      // 11) Ligne horizontale inférieure

      page.drawLine({
        start: { x: margin + 20, y: 70 },
        end: { x: separatorX - margin, y: 70 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      // 12) Date en bas

      const dateSize = 18;
      const dateW = fontBold.widthOfTextAtSize(titleWithSeason, dateSize);
      const dateY = 40;
      page.drawText(titleWithSeason, {
        x: (leftWidth - dateW) / 2 + margin,
        y: dateY,
        size: dateSize,
        font: fontBold,
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
      const port = Number(process.env.SMTP_PORT) || 465;
      const secure = port === 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        requireTLS: !secure, // impose STARTTLS si port 587
        tls: { minVersion: "TLSv1.2" }, // bonne pratique
      });

      await transporter.sendMail({
        from: `"Billetterie Mégatoit" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🎟 Votre abonnement Mégatoit pour la saison ${abonnement.data.season}`,
        html: `
          <div style="text-align:center">
            <img src="cid:logo" alt="Logo" style="width:150px;height:auto" />
          </div>
          <p style="text-align:center;font-weight:bold;font-size:22px">
            Commande confirmée !
          </p>
          <p style="text-align:center;font-size:16px">
            Votre commande <strong>№${order.code}</strong> est confirmée.
            Vous trouverez en pièce jointe votre abonnement.
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
            cid: "logo",
          },
        ],
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error generating or sending PDF:", error);
    throw new Error("Failed to generate or send PDF");
  }
}
