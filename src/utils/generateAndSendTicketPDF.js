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
    const logoPath = path.join(process.cwd(), "public", "logo-big.jpeg");

    const userName = user.userName.toUpperCase();
    let match = null;

    if (tickets.length > 0) {
      match = await getMatchById(tickets[0].matchId);

      const team1Name = match?.homeTeam?.name || "BSR DE TROIS-RIVIÈRES";
      const team2Name = match?.opponent?.name || "Adversaire";

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
        // 1) création du document et de la page
        const pdfDoc = await PDFDocument.create();
        // page plus large pour passer le QR à droite
        const page = pdfDoc.addPage([800, 320]);
        const { width, height } = page.getSize();

        // 2) fonts
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // 3) données
        const placeText = match.place;
        const ticketCode = ticket.TicketCode;

        // Helper to embed team logo from URL (PNG/JPG) with local fallback
        const embedTeamLogo = async (imageUrl) => {
          if (imageUrl) {
            try {
              const res = await fetch(imageUrl);
              if (res.ok) {
                const buffer = await res.arrayBuffer();
                try {
                  return await pdfDoc.embedPng(buffer);
                } catch {
                  return await pdfDoc.embedJpg(buffer);
                }
              }
            } catch (e) {
              console.error(`Error fetching team logo from ${imageUrl}:`, e);
            }
          }
          const logoBytes = fs.readFileSync(logoPath);
          try {
            return await pdfDoc.embedPng(logoBytes);
          } catch {
            return await pdfDoc.embedJpg(logoBytes);
          }
        };

        // 4) embeds
        const team1LogoImage = await embedTeamLogo(match?.homeTeam?.imageUrl);
        const team2LogoImage = await embedTeamLogo(match?.opponent?.imageUrl);
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
        const title = `BILLET N° ${ticketCode}`;
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
        const ADMINSSION_NOTE = "ADMISSION GÉNÉRALE";
        const ADMINSSION_NOTE_SIZE = 20;
        const ADMINSSION_NOTE_W = fontBold.widthOfTextAtSize(
          ADMINSSION_NOTE,
          ADMINSSION_NOTE_SIZE
        );
        const ADMINSSION_NOTE_Y = height - 80 - 35; // 20px sous le header
        page.drawText(ADMINSSION_NOTE, {
          x: (leftWidth - ADMINSSION_NOTE_W) / 2 + margin,
          y: ADMINSSION_NOTE_Y,
          size: ADMINSSION_NOTE_SIZE,
          font: fontBold,
        });

        // 9) Header logos + « VS » (Fixed symmetric 2-block layout with text wrapping)
        const vsText = " VS ";
        const vsSize = 22;
        const vsW = fontBold.widthOfTextAtSize(vsText, vsSize);

        const centerX = margin + leftWidth / 2;
        const vsX = centerX - vsW / 2;
        const headerY = height - 165;

        // Draw " VS " in the center
        page.drawText(vsText, {
          x: vsX,
          y: headerY - 5,
          size: vsSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Compute equal fixed block widths
        const leftBlockMinX = margin + 15;
        const leftBlockMaxX = vsX - 10;
        const blockWidth = leftBlockMaxX - leftBlockMinX;

        const rightBlockMaxX = separatorX - margin - 15;

        // Scale logos to max 55x55 maintaining aspect ratio
        const fitLogo = (img, maxW = 55, maxH = 55) => {
          const s = Math.min(maxW / img.width, maxH / img.height);
          return { width: img.width * s, height: img.height * s };
        };

        const team1Dims = fitLogo(team1LogoImage);
        const team2Dims = fitLogo(team2LogoImage);

        // Helper to wrap & scale team name to fit inside remaining text width (1 or 2 lines)
        const wrapAndScaleTeamName = (text, maxWidth) => {
          let fSize = 16;
          const minFSize = 10;

          while (fSize >= minFSize) {
            const singleW = fontBold.widthOfTextAtSize(text, fSize);
            if (singleW <= maxWidth) {
              return { lines: [text], fontSize: fSize, lineHeight: fSize * 1.15 };
            }

            const words = text.split(" ");
            if (words.length > 1) {
              let bestLines = null;
              let minDiff = Infinity;

              for (let i = 1; i < words.length; i++) {
                const l1 = words.slice(0, i).join(" ");
                const l2 = words.slice(i).join(" ");
                const w1 = fontBold.widthOfTextAtSize(l1, fSize);
                const w2 = fontBold.widthOfTextAtSize(l2, fSize);

                if (w1 <= maxWidth && w2 <= maxWidth) {
                  const diff = Math.abs(w1 - w2);
                  if (diff < minDiff) {
                    minDiff = diff;
                    bestLines = [l1, l2];
                  }
                }
              }

              if (bestLines) {
                return { lines: bestLines, fontSize: fSize, lineHeight: fSize * 1.15 };
              }
            }

            fSize -= 1;
          }

          const words = text.split(" ");
          const mid = Math.ceil(words.length / 2);
          return {
            lines: [words.slice(0, mid).join(" "), words.slice(mid).join(" ")],
            fontSize: minFSize,
            lineHeight: minFSize * 1.15,
          };
        };

        // --- Team 1 Block (Left): [Logo 1] [Name 1] ---
        page.drawImage(team1LogoImage, {
          x: leftBlockMinX,
          y: headerY - team1Dims.height / 2,
          width: team1Dims.width,
          height: team1Dims.height,
        });

        const text1AvailableW = blockWidth - team1Dims.width - 8;
        const wrapped1 = wrapAndScaleTeamName(team1Name, text1AvailableW);
        const text1X = leftBlockMinX + team1Dims.width + 8;

        if (wrapped1.lines.length === 1) {
          page.drawText(wrapped1.lines[0], {
            x: text1X,
            y: headerY - wrapped1.fontSize / 3,
            size: wrapped1.fontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
        } else {
          page.drawText(wrapped1.lines[0], {
            x: text1X,
            y: headerY + wrapped1.lineHeight / 2 - 3,
            size: wrapped1.fontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
          page.drawText(wrapped1.lines[1], {
            x: text1X,
            y: headerY - wrapped1.lineHeight / 2 - 3,
            size: wrapped1.fontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
        }

        // --- Team 2 Block (Right): [Name 2] [Logo 2] ---
        const logo2X = rightBlockMaxX - team2Dims.width;
        page.drawImage(team2LogoImage, {
          x: logo2X,
          y: headerY - team2Dims.height / 2,
          width: team2Dims.width,
          height: team2Dims.height,
        });

        const text2AvailableW = blockWidth - team2Dims.width - 8;
        const wrapped2 = wrapAndScaleTeamName(team2Name, text2AvailableW);
        const text2RightX = logo2X - 8;

        if (wrapped2.lines.length === 1) {
          const w = fontBold.widthOfTextAtSize(wrapped2.lines[0], wrapped2.fontSize);
          page.drawText(wrapped2.lines[0], {
            x: text2RightX - w,
            y: headerY - wrapped2.fontSize / 3,
            size: wrapped2.fontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
        } else {
          const w1 = fontBold.widthOfTextAtSize(wrapped2.lines[0], wrapped2.fontSize);
          const w2 = fontBold.widthOfTextAtSize(wrapped2.lines[1], wrapped2.fontSize);

          page.drawText(wrapped2.lines[0], {
            x: text2RightX - w1,
            y: headerY + wrapped2.lineHeight / 2 - 3,
            size: wrapped2.fontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
          page.drawText(wrapped2.lines[1], {
            x: text2RightX - w2,
            y: headerY - wrapped2.lineHeight / 2 - 3,
            size: wrapped2.fontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
        }

        // 10) Texte du lieu
        const logoH = 55;
        const placeSize = 16;
        const placeW = fontRegular.widthOfTextAtSize(placeText, placeSize);
        const placeY = headerY - logoH + 20; // 20px sous le header
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

      console.log("📧 [EMAIL TICKET] Configuration SMTP :", {
        host: process.env.SMTP_HOST,
        port,
        user: process.env.EMAIL_USER,
        to: user.email,
        ticketsCount: tickets.length,
      });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // true for 465, false for 587
        requireTLS: false, // only require STARTTLS on ports like 587
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { minVersion: "TLSv1.2" },
      });

      try {
        console.log("⏳ [EMAIL TICKET] Vérification connexion SMTP...");
        await transporter.verify();
        console.log("✅ [EMAIL TICKET] Connexion SMTP vérifiée avec succès !");
      } catch (verifyError) {
        console.error("❌ [EMAIL TICKET] ÉCHEC VÉRIFICATION SMTP :", verifyError);
        throw verifyError;
      }

      const subjectTickets = ` ${tickets.length > 1 ? "Vos billets" : "Votre billet"
        } - ${team1Name} vs ${team2Name}`;
      const textTickets =
        `Commande confirmée (N°${order.code}).\n` +
        `${tickets.length > 1 ? "Billets" : "Billet"
        } en pièce jointe (PDF).\n` +
        `Émetteur : Billetterie BSR DE TROIS-RIVIÈRES <billets@bsr3r.com>\n` +
        `Si vous n'êtes pas à l'origine de cet achat, contactez support@bsr3r.com.`;

      // ton HTML existant:
      const htmlTickets = `
  <div style="text-align:center">
    <img src="cid:logo-big" alt="BSR DE TROIS-RIVIÈRES" style="width:150px;height:auto" />
  </div>
  <p style="text-align:center;font-weight:bold;font-size:22px">Commande confirmée !</p>
  <p style="text-align:center;font-size:16px">
    Votre commande <strong>N° ${order.code}</strong> est confirmée.
    Vous trouverez en pièce jointe ${tickets.length > 1 ? "vos billets" : "votre billet"
        }.
  </p>
`;

      try {
        console.log(`⏳ [EMAIL TICKET] Envoi de l'email à ${user.email}...`);
        const mailInfo = await transporter.sendMail({
          from: `${process.env.EMAIL_USER}`,
          to: user.email,
          subject: subjectTickets,
          text: textTickets, // << ajoute la version texte
          html: htmlTickets,
          envelope: {
            from: process.env.EMAIL_USER, // MAIL FROM / Return-Path = billets@bsr3r.com
            to: user.email,
          },
          headers: {
            "List-Unsubscribe": `<mailto:support@bsr3r.com>`,
            "X-Entity-Type": "Transactional", // indicatif, certains filtres aiment
          },
          attachments: [
            ...attachments,
            {
              filename: "logo-big.jpeg",
              path: path.join(process.cwd(), "public", "logo-big.jpeg"),
              cid: "logo-big",
            },
          ],
        });
        console.log("✅ [EMAIL TICKET] Email envoyé avec succès !", mailInfo.messageId || mailInfo);
      } catch (sendError) {
        console.error("❌ [EMAIL TICKET] ÉCHEC DE L'ENVOI PAR NODEMAILER :", sendError);
        throw sendError;
      }
    }

    // Subscription PDF (unchanged except logo size/position)
    if (subscription) {
      const abonnement = await getAbonementById(subscription.abonnementId);

      const pdfDoc = await PDFDocument.create();
      // page plus large pour passer le QR à droite
      const page = pdfDoc.addPage([800, 320]);
      const { width, height } = page.getSize();

      // 2) fonts
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // 3) données

      const ticketCode = subscription.code;

      // 4) embeds
      const logoBytes = fs.readFileSync(logoPath);
      let team1LogoImage;
      try {
        team1LogoImage = await pdfDoc.embedPng(logoBytes);
      } catch {
        team1LogoImage = await pdfDoc.embedJpg(logoBytes);
      }
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

      const title = `ABONNEMENT N° ${ticketCode}`;
      const titleSize = 20;

      const userText = String(userName || "");
      let userSize = 22; // taille du userName (gras)
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

      // 8) Ligne horizontale supérieure
      page.drawLine({
        start: { x: margin + 20, y: height - 80 },
        end: { x: separatorX - margin, y: height - 80 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      const ADMINSSION_NOTE = "ADMISSION GÉNÉRALE";
      const ADMINSSION_NOTE_SIZE = 20;
      const ADMINSSION_NOTE_W = fontBold.widthOfTextAtSize(
        ADMINSSION_NOTE,
        ADMINSSION_NOTE_SIZE
      );
      const ADMINSSION_NOTE_Y = height - 80 - 35; // 20px sous le header
      page.drawText(ADMINSSION_NOTE, {
        x: (leftWidth - ADMINSSION_NOTE_W) / 2 + margin,
        y: ADMINSSION_NOTE_Y,
        size: ADMINSSION_NOTE_SIZE,
        font: fontBold,
      });

      //i want i the center of the pdf add the logo of megatoit
      const logoH = 100; // hauteur du logo
      const logoDims = team1LogoImage.scale(logoH / team1LogoImage.height);
      const logoX = (leftWidth - logoDims.width) / 2 + margin;
      const logoY = height - 155;
      page.drawImage(team1LogoImage, {
        x: logoX,
        y: logoY - logoDims.height / 2 + titleSize / 2 - 30,
        width: logoDims.width,
        height: logoDims.height,
      });
      const noteSize = 16;
      const noteText = "Valide pour (1) consommation gratuite par match";
      const noteW = fontRegular.widthOfTextAtSize(noteText, noteSize);
      const noteY = logoY - 90;
      page.drawText(noteText, {
        x: (leftWidth - noteW) / 2 + margin,
        y: noteY,
        size: noteSize,
        font: fontRegular,
      });

      // 11) Ligne horizontale inférieure

      page.drawLine({
        start: { x: margin + 20, y: 60 },
        end: { x: separatorX - margin, y: 60 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      // 12) Date en bas

      const dateSize = 18;
      const dateW = fontBold.widthOfTextAtSize(titleWithSeason, dateSize);
      const dateY = 35;
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

      console.log("📧 [EMAIL ABONNEMENT] Configuration SMTP :", {
        host: process.env.SMTP_HOST,
        port,
        user: process.env.EMAIL_USER,
        to: user.email,
      });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        requireTLS: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { minVersion: "TLSv1.2" },
      });

      try {
        console.log("⏳ [EMAIL ABONNEMENT] Vérification connexion SMTP...");
        await transporter.verify();
        console.log("✅ [EMAIL ABONNEMENT] Connexion SMTP vérifiée avec succès !");
      } catch (verifyError) {
        console.error("❌ [EMAIL ABONNEMENT] ÉCHEC VÉRIFICATION SMTP :", verifyError);
        throw verifyError;
      }

      try {
        console.log(`⏳ [EMAIL ABONNEMENT] Envoi de l'email d'abonnement à ${user.email}...`);
        const mailInfo = await transporter.sendMail({
          from: `${process.env.EMAIL_USER}`,
          to: user.email,
          subject: `Votre abonnement BSR DE TROIS-RIVIÈRES pour la saison ${abonnement.data.season}`,
          text:
            `Votre abonnement pour la saison ${abonnement.data.season} est prêt !\n\n` +
            `Téléchargez-le en pièce jointe.\n\n` +
            `Émetteur : Billetterie BSR DE TROIS-RIVIÈRES <${process.env.EMAIL_USER}>`,
          html: `
            <div style="text-align:center">
          <img src="cid:logo-big" alt="BSR DE TROIS-RIVIÈRES" style="width:150px;height:auto" />
            </div>
            <p style="text-align:center;font-weight:bold;font-size:22px">
          Commande confirmée !
            </p>
            <p style="text-align:center;font-size:16px">
          Votre commande <strong>N° ${order.code}</strong> est confirmée.
          Vous trouverez en pièce jointe votre abonnement.
            </p>
            <p style="background:#f7f7f7;border-radius:8px;padding:16px 20px;margin:24px auto 16px auto;max-width:500px;font-size:15px;color:#333;text-align:center;border:1px solid #e0e0e0;">
          <strong style="color:#1976d2;">Note :</strong>
          Ce billet de saison donne droit à l’accès à tous les matchs de
          la saison régulière du BSR DE TROIS-RIVIÈRES.<br>
          Il est <b>unique</b> et <b>incessible</b>.<br>
          Sa présentation est <u>obligatoire</u> à chaque entrée au Colisée Jean-Guy Talbot.
            </p>
          `,
          envelope: {
            from: process.env.EMAIL_USER,
            to: user.email,
          },
          headers: {
            "List-Unsubscribe": `<mailto:support@bsr3r.com>`,
            "X-Entity-Type": "Transactional",
          },
          attachments: [
            {
              filename: `abonnement-${subscription.code}.pdf`,
              content: pdfBytes,
              contentType: "application/pdf",
            },
            {
              filename: "logo-big.jpeg",
              content: logoBytes,
              cid: "logo-big",
            },
          ],
        });
        console.log("✅ [EMAIL ABONNEMENT] Email d'abonnement envoyé avec succès !", mailInfo.messageId || mailInfo);
      } catch (sendError) {
        console.error("❌ [EMAIL ABONNEMENT] ÉCHEC DE L'ENVOI PAR NODEMAILER :", sendError);
        throw sendError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error generating or sending PDF:", error);
    throw new Error("Failed to generate or send PDF");
  }
}
