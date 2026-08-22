// services/email.service.ts

import { PDFDocument, rgb, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
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

async function drawHorizontalTicket(pdfDoc, data) {
  pdfDoc.registerFontkit(fontkit);
  const fontBebasPath = path.join(process.cwd(), "public", "fonts", "BebasNeue-Regular.ttf");
  const fontLatoRegPath = path.join(process.cwd(), "public", "fonts", "Lato-Regular.ttf");
  const fontLatoBoldPath = path.join(process.cwd(), "public", "fonts", "Lato-Bold.ttf");
  const fontLatoBlackPath = path.join(process.cwd(), "public", "fonts", "Lato-Black.ttf");

  const fontBebas = await pdfDoc.embedFont(fs.readFileSync(fontBebasPath));
  const fontLato = await pdfDoc.embedFont(fs.readFileSync(fontLatoRegPath));
  const fontLatoBold = await pdfDoc.embedFont(fs.readFileSync(fontLatoBoldPath));
  const fontLatoBlack = await pdfDoc.embedFont(fs.readFileSync(fontLatoBlackPath));

  const width = data.isSubscription ? 1050 : 900;
  const height = data.isSubscription ? 400 : 340;
  const page = pdfDoc.addPage([width, height]);

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0, 0, 0) });

  const greenColor = rgb(123 / 255, 253 / 255, 72 / 255);
  page.drawRectangle({ x: 0, y: 0, width: 46, height, color: greenColor });
  
  const admTextRaw = "ADMISSION GÉNÉRALE";
  const chars = admTextRaw.split('');
  let charsTotalWidth = 0;
  for (const c of chars) charsTotalWidth += fontBebas.widthOfTextAtSize(c, 21);
  const totalAvailableHeight = height - 40; 
  const charSpacing = chars.length > 1 ? (totalAvailableHeight - charsTotalWidth) / (chars.length - 1) : 0;
  let currentY = 20; 
  const centeredX = 34; 
  for (const c of chars) {
    page.drawText(c, { x: centeredX, y: currentY, size: 21, font: fontBebas, color: rgb(0, 0, 0), rotate: degrees(90) });
    currentY += fontBebas.widthOfTextAtSize(c, 21) + charSpacing;
  }

  const rightColX = width - 236;
  
  page.drawLine({
    start: { x: rightColX, y: 20 }, end: { x: rightColX, y: height - 20 },
    thickness: 1, color: rgb(51 / 255, 51 / 255, 51 / 255), dashArray: [4, 4],
  });

  const qrBoxSize = data.isSubscription ? 180 : 144;
  const qrBoxX = rightColX + (236 - qrBoxSize) / 2;
  const qrBoxY = height - 50 - qrBoxSize; 
  
  page.drawRectangle({ x: qrBoxX - 8, y: qrBoxY - 8, width: qrBoxSize + 16, height: qrBoxSize + 16, color: rgb(1, 1, 1) });
  if (data.qrImage) {
    page.drawImage(data.qrImage, { x: qrBoxX, y: qrBoxY, width: qrBoxSize, height: qrBoxSize });
  }

  if (data.isSubscription) {
    const tcSize = 18;
    const tcW = fontLatoBold.widthOfTextAtSize(data.ticketCode, tcSize);
    const tcY = qrBoxY - 50; 
    const tcBoxW = tcW + 24; 
    const tcBoxH = tcSize + 18; 
    
    page.drawRectangle({
      x: rightColX + 236 / 2 - tcBoxW / 2, y: tcY - 9, width: tcBoxW, height: tcBoxH,
      color: rgb(123/255 * 0.12, 253/255 * 0.12, 72/255 * 0.12),
      borderColor: rgb(123/255 * 0.4, 253/255 * 0.4, 72/255 * 0.4), borderWidth: 1
    });
    page.drawText(data.ticketCode, { x: rightColX + 236 / 2 - tcW / 2, y: tcY, size: tcSize, font: fontLatoBold, color: greenColor });

    const midX = 46;
    let myX = midX + 26;
    const logoSizeTop = 90;
    if(data.team1LogoImage) {
      page.drawImage(data.team1LogoImage, { x: myX, y: height - 40 - logoSizeTop, width: logoSizeTop, height: logoSizeTop });
    }
    page.drawText("Billet de saison", { x: myX + logoSizeTop + 20, y: height - 80, size: 48, font: fontBebas, color: rgb(1,1,1) });
    page.drawText(data.monthYearStr, { x: myX + logoSizeTop + 20, y: height - 120, size: 38, font: fontBebas, color: greenColor });

    const venueValW = fontBebas.widthOfTextAtSize(data.venue, 32);
    page.drawText(data.venue, { x: rightColX - 26 - venueValW, y: height - 85, size: 32, font: fontBebas, color: rgb(1, 1, 1) });
    const addr1 = data.addr1 || "1740 Av. Gilles-Villeneuve";
    const addr2 = data.addr2 || "Trois-Rivières, QC G8Y 7B6";
    const addrColor = rgb(154/255, 154/255, 154/255);
    page.drawText(addr1, { x: rightColX - 26 - fontLato.widthOfTextAtSize(addr1, 16), y: height - 110, size: 16, font: fontLato, color: addrColor });
    page.drawText(addr2, { x: rightColX - 26 - fontLato.widthOfTextAtSize(addr2, 16), y: height - 130, size: 16, font: fontLato, color: addrColor });

    const topBorderY = height - 180;
    page.drawLine({ start: { x: midX + 26, y: topBorderY }, end: { x: rightColX - 26, y: topBorderY }, thickness: 1, color: rgb(35/255, 35/255, 35/255) });

    const bottomSectionY = 85;
    const teamSectionH = topBorderY - bottomSectionY;
    const bottomMidY = bottomSectionY + teamSectionH / 2;

    let bnW = fontBebas.widthOfTextAtSize(data.buyerName, 56);
    let bNameSize = 56;
    while (bnW > 380 && bNameSize > 15) { bNameSize--; bnW = fontBebas.widthOfTextAtSize(data.buyerName, bNameSize); }
    page.drawText(data.buyerName, { x: midX + 26, y: bottomMidY - 20, size: bNameSize, font: fontBebas, color: rgb(1,1,1) });

    const smText = "TOUS LES MATCHS À DOMICILE";
    const srText = "Saison régulière";
    const smW = fontLatoBold.widthOfTextAtSize(smText, 14);
    const srW = fontBebas.widthOfTextAtSize(srText, 34);
    page.drawText(smText, { x: rightColX - 26 - smW, y: bottomMidY + 10, size: 14, font: fontLatoBold, color: rgb(102/255, 102/255, 102/255) });
    page.drawText(srText, { x: rightColX - 26 - srW, y: bottomMidY - 25, size: 34, font: fontBebas, color: greenColor });

    page.drawLine({ start: { x: midX, y: bottomSectionY }, end: { x: rightColX, y: bottomSectionY }, thickness: 1, color: rgb(35/255, 35/255, 35/255) });
    
    try {
      const courteauPath = path.join(process.cwd(), "public", "commenditaires", "Courteau.jpg");
      let courteauImg;
      try { courteauImg = await pdfDoc.embedPng(fs.readFileSync(courteauPath)); }
      catch { courteauImg = await pdfDoc.embedJpg(fs.readFileSync(courteauPath)); }
      const cDims = courteauImg.scale(42 / courteauImg.height);
      const courteauBoxX = midX + 26;
      page.drawRectangle({ x: courteauBoxX, y: 18, width: cDims.width + 18, height: 52, color: rgb(1,1,1) });
      page.drawImage(courteauImg, { x: courteauBoxX + 9, y: 23, width: cDims.width, height: cDims.height });
    } catch(err) { console.error("Error loading sponsor logo:", err.message); }
  } else {
    let bNameSize = 26;
    let bnW = fontBebas.widthOfTextAtSize(data.buyerName, bNameSize);
    let adjustedBNameSize = bNameSize;
    while (bnW > 200 && adjustedBNameSize > 12) {
      adjustedBNameSize--;
      bnW = fontBebas.widthOfTextAtSize(data.buyerName, adjustedBNameSize);
    }
    const bNameY = qrBoxY - 40;
    page.drawText(data.buyerName, { x: rightColX + 236 / 2 - bnW / 2, y: bNameY, size: adjustedBNameSize, font: fontBebas, color: rgb(1, 1, 1) });

    const tcSize = 15;
    const tcW = fontLatoBold.widthOfTextAtSize(data.ticketCode, tcSize);
    const tcY = bNameY - 35; 
    const tcBoxW = tcW + 20; 
    const tcBoxH = tcSize + 14; 
    
    page.drawRectangle({
      x: rightColX + 236 / 2 - tcBoxW / 2, y: tcY - 7, width: tcBoxW, height: tcBoxH,
      color: rgb(123/255 * 0.12, 253/255 * 0.12, 72/255 * 0.12),
      borderColor: rgb(123/255 * 0.4, 253/255 * 0.4, 72/255 * 0.4), borderWidth: 1
    });
    page.drawText(data.ticketCode, { x: rightColX + 236 / 2 - tcW / 2, y: tcY, size: tcSize, font: fontLatoBold, color: greenColor });

    const midX = 46;
    const midW = 618;
    
    let myX = midX + 26;
    if(data.dayStr) {
      page.drawText(data.dayStr, { x: myX, y: height - 110, size: 96, font: fontBebas, color: rgb(1, 1, 1) });
      myX += fontBebas.widthOfTextAtSize(data.dayStr, 96) + 12;
    }
    page.drawText(data.monthYearStr, { x: myX, y: height - 110, size: 32, font: fontBebas, color: greenColor });
    page.drawText(data.timeStr, { x: myX, y: height - 130, size: 14, font: fontLatoBold, color: rgb(140 / 255, 140 / 255, 140 / 255) });

    const venueValW = fontBebas.widthOfTextAtSize(data.venue, 28);
    page.drawText(data.venue, { x: rightColX - 26 - venueValW, y: height - 70, size: 28, font: fontBebas, color: rgb(1, 1, 1) });
    
    const addr1 = data.addr1 || "1740 Av. Gilles-Villeneuve";
    const addr2 = data.addr2 || "Trois-Rivières, QC G8Y 7B6";
    const addrColor = rgb(154/255, 154/255, 154/255);
    page.drawText(addr1, { x: rightColX - 26 - fontLato.widthOfTextAtSize(addr1, 14), y: height - 95, size: 14, font: fontLato, color: addrColor });
    page.drawText(addr2, { x: rightColX - 26 - fontLato.widthOfTextAtSize(addr2, 14), y: height - 110, size: 14, font: fontLato, color: addrColor });

    const topBorderY = height - 150;
    page.drawLine({ start: { x: midX + 26, y: topBorderY }, end: { x: rightColX - 26, y: topBorderY }, thickness: 1, color: rgb(35 / 255, 35 / 255, 35 / 255) });

    const bottomSectionY = 75; 
    const teamSectionH = topBorderY - bottomSectionY;
    const bottomMidY = bottomSectionY + teamSectionH / 2; 

    const logoSize = 64;
    const logoY = bottomMidY - logoSize / 2;
    
    if(data.team1LogoImage) {
      page.drawImage(data.team1LogoImage, { x: midX + 26, y: logoY, width: logoSize, height: logoSize });
    }
    const team1Y = bottomMidY - 12;
    
    const getBestLayout = (text) => {
      let size = 36;
      while (size > 14) {
        if (fontBebas.widthOfTextAtSize(text, size) <= 200) {
          return { size, lines: [text] };
        }
        const breakChars = [' ', '-'];
        let bestSplitIndex = -1;
        let minDiff = Infinity;
        for (let i = 0; i < text.length; i++) {
          if (breakChars.includes(text[i])) {
            const line1 = text.substring(0, i + (text[i] === '-' ? 1 : 0)).trim();
            const line2 = text.substring(i + 1).trim();
            const w1 = fontBebas.widthOfTextAtSize(line1, size);
            const w2 = fontBebas.widthOfTextAtSize(line2, size);
            if (w1 <= 200 && w2 <= 200) {
              const diff = Math.abs(w1 - w2);
              if (diff < minDiff) { minDiff = diff; bestSplitIndex = i; }
            }
          }
        }
        if (bestSplitIndex !== -1) {
          const isHyphen = text[bestSplitIndex] === '-';
          return { size, lines: [ text.substring(0, bestSplitIndex + (isHyphen ? 1 : 0)).trim(), text.substring(bestSplitIndex + 1).trim() ] };
        }
        size--;
      }
      return { size: 14, lines: [text] };
    };

    const layout1 = getBestLayout(data.team1Name);
    const layout2 = getBestLayout(data.team2Name);
    
    const finalSize = Math.min(layout1.size, layout2.size);
    const lineHeight = finalSize * 1.1;

    const drawTeamLines = (lines, x, align) => {
      let startY = team1Y + (lines.length - 1) * (lineHeight / 2);
      for (const line of lines) {
        const w = fontBebas.widthOfTextAtSize(line, finalSize);
        let px = align === 'right' ? x - w : x;
        page.drawText(line, { x: px, y: startY, size: finalSize, font: fontBebas, color: rgb(1, 1, 1) });
        startY -= lineHeight;
      }
    };

    drawTeamLines(layout1.lines, midX + 26 + logoSize + 16, 'left');
    
    const vsW = fontLatoBlack.widthOfTextAtSize("VS", 16);
    page.drawText("VS", { x: midX + midW / 2 - vsW / 2, y: bottomMidY - 6, size: 16, font: fontLatoBlack, color: greenColor });

    drawTeamLines(layout2.lines, rightColX - 26 - logoSize - 16, 'right');
    
    if(data.team2LogoImage) {
      page.drawImage(data.team2LogoImage, { x: rightColX - 26 - logoSize, y: logoY, width: logoSize, height: logoSize });
    }

    page.drawLine({ start: { x: midX, y: bottomSectionY }, end: { x: rightColX, y: bottomSectionY }, thickness: 1, color: rgb(35 / 255, 35 / 255, 35 / 255) });
    
    try {
      const courteauPath = path.join(process.cwd(), "public", "commenditaires", "Courteau.jpg");
      let courteauImg;
      try { courteauImg = await pdfDoc.embedPng(fs.readFileSync(courteauPath)); }
      catch { courteauImg = await pdfDoc.embedJpg(fs.readFileSync(courteauPath)); }
      const cDims = courteauImg.scale(35 / courteauImg.height);
      const courteauBoxX = midX + 26;
      page.drawRectangle({ x: courteauBoxX, y: 15, width: cDims.width + 16, height: 45, color: rgb(1,1,1) });
      page.drawImage(courteauImg, { x: courteauBoxX + 8, y: 20, width: cDims.width, height: cDims.height });
    } catch (e) {
      console.error("Courteau logo error:", e);
    }
  }
}

export async function generateAndSendTicketPDF(user, tickets, order, subscription) {
  try {
    const bucket = getStorage().bucket();
    const logoPath = path.join(process.cwd(), "public", "logo-big.jpeg");
    const userName = user.userName.toUpperCase();
    const attachments = [];
    const downloadLinks = [];

    const embedTeamLogo = async (pdfDoc, imageUrl) => {
      if (imageUrl) {
        try {
          const res = await fetch(imageUrl);
          if (res.ok) {
            const buffer = await res.arrayBuffer();
            try { return await pdfDoc.embedPng(buffer); } catch { return await pdfDoc.embedJpg(buffer); }
          }
        } catch (e) { console.error("Error fetching team logo", e); }
      }
      const logoBytes = fs.readFileSync(logoPath);
      try { return await pdfDoc.embedPng(logoBytes); } catch { return await pdfDoc.embedJpg(logoBytes); }
    };

    if (tickets.length > 0) {
      const match = await getMatchById(tickets[0].matchId);
      const isHome = match?.type === "Domicile";
      
      const team1Name = isHome ? (match?.opponent?.name || "Adversaire") : (match?.homeTeam?.name || "BSR DE TROIS-RIVIERES");
      const team1ImageUrl = isHome ? match?.opponent?.imageUrl : match?.homeTeam?.imageUrl;
      const team2Name = isHome ? (match?.homeTeam?.name || "BSR DE TROIS-RIVIERES") : (match?.opponent?.name || "Adversaire");
      const team2ImageUrl = isHome ? match?.homeTeam?.imageUrl : match?.opponent?.imageUrl;

      const ms = match.date.seconds * 1000 + match.date.nanoseconds / 1000000;
      const dateObj = new Date(ms);
      const dayStr = dateObj.getDate().toString();
      const monthYearStr = dateObj.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).toUpperCase();
      const timeStr = `${dateObj.toLocaleDateString("fr-FR", { weekday: "long" })} · ${dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`.toUpperCase();

      let addr1 = "1740 Av. Gilles-Villeneuve";
      let addr2 = "Trois-Rivières, QC G8Y 7B6";
      
      const isSpecialMatch = 
        (dayStr === "23" && monthYearStr === "JANVIER 2027") || 
        (dayStr === "19" && monthYearStr === "SEPTEMBRE 2026");

      if (isSpecialMatch) {
        addr1 = "375 Rue Germain";
        addr2 = "Saint-Léonard-d'Aston, QC J0C 1M0";
      }

      for (const ticket of tickets) {
        const pdfDoc = await PDFDocument.create();
        const team1LogoImage = await embedTeamLogo(pdfDoc, team1ImageUrl);
        const team2LogoImage = await embedTeamLogo(pdfDoc, team2ImageUrl);
        const qrImage = await pdfDoc.embedPng(ticket.qrCodeImage);

        await drawHorizontalTicket(pdfDoc, {
          ticketCode: ticket.TicketCode,
          buyerName: userName,
          team1Name, team1LogoImage,
          team2Name, team2LogoImage,
          dayStr, monthYearStr, timeStr,
          venue: match.place || "Colisée Jean-Guy-Talbot",
          addr1,
          addr2,
          qrImage,
          isSubscription: false
        });

        const pdfBytes = await pdfDoc.save();
        const fileName = `tickets/${ticket.TicketCode}.pdf`;
        const file = bucket.file(fileName);
        await file.save(pdfBytes, { metadata: { contentType: "application/pdf" } });
        await file.makePublic();
        const downloadURL = file.publicUrl();
        downloadLinks.push(downloadURL);
        await updateTicketDownLoadUrl(ticket.TicketCode, downloadURL);
        
        attachments.push({
          filename: `billet-${ticket.TicketCode}.pdf`,
          content: pdfBytes,
          contentType: "application/pdf",
        });
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

      const subjectTickets = ` ${tickets.length > 1 ? "Vos billets" : "Votre billet"} - ${team1Name} vs ${team2Name}`;
      const htmlTickets = `
  <div style="text-align:center">
    <img src="cid:logo-big" alt="BSR DE TROIS-RIVIÈRES" style="width:150px;height:auto" />
  </div>
  <p style="text-align:center;font-weight:bold;font-size:22px">Commande confirmée !</p>
  <p style="text-align:center;font-size:16px">
    Votre commande <strong>N° ${order.code}</strong> est confirmée.
    Vous trouverez en pièce jointe ${tickets.length > 1 ? "vos billets" : "votre billet"}.
  </p>
`;

      try {
        await transporter.sendMail({
          from: `${process.env.EMAIL_USER}`,
          to: user.email,
          subject: subjectTickets,
          text: "Commande confirmée. Billet(s) en pièce jointe.",
          html: htmlTickets,
          envelope: { from: process.env.EMAIL_USER, to: user.email },
          attachments: [
            ...attachments,
            { filename: "logo-big.jpeg", path: path.join(process.cwd(), "public", "logo-big.jpeg"), cid: "logo-big" },
          ],
        });
      } catch (e) { console.error("Email send failed", e); }
    }

    if (subscription) {
      const abonnement = await getAbonementById(subscription.abonnementId);
      const pdfDoc = await PDFDocument.create();
      
      const logoBytes = fs.readFileSync(logoPath);
      let teamLogo;
      try { teamLogo = await pdfDoc.embedPng(logoBytes); } catch { teamLogo = await pdfDoc.embedJpg(logoBytes); }
      const qrImage = await pdfDoc.embedPng(subscription.qrCodeImage);

      await drawHorizontalTicket(pdfDoc, {
        ticketCode: subscription.code,
        buyerName: userName,
        team1Name: "BSR DE TROIS-RIVIERES", team1LogoImage: teamLogo,
        team2Name: abonnement.data.title, team2LogoImage: teamLogo,
        dayStr: "", monthYearStr: abonnement.data.season.replace("-", " – "), timeStr: "BILLET DE SAISON",
        venue: "Colisée Jean-Guy-Talbot",
        qrImage,
        isSubscription: true
      });

      const pdfBytes = await pdfDoc.save();
      const fileName = `abonnements/${subscription.code}.pdf`;
      const file = bucket.file(fileName);
      await file.save(pdfBytes, { metadata: { contentType: "application/pdf" } });
      await file.makePublic();
      await updateSubscriptionDownloadUrl(subscription.code, file.publicUrl());
      
      const port = Number(process.env.SMTP_PORT) || 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port, secure: port === 465, requireTLS: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { minVersion: "TLSv1.2" },
      });

      try {
        await transporter.sendMail({
          from: `${process.env.EMAIL_USER}`, to: user.email,
          subject: `Votre abonnement pour la saison ${abonnement.data.season}`,
          text: "Votre abonnement est prêt.",
          html: `
            <div style="text-align:center"><img src="cid:logo-big" alt="BSR" style="width:150px;height:auto" /></div>
            <p style="text-align:center;font-weight:bold;font-size:22px">Commande confirmée !</p>
            <p style="text-align:center;font-size:16px">Votre abonnement est en pièce jointe.</p>`,
          attachments: [
            { filename: `abonnement-${subscription.code}.pdf`, content: pdfBytes, contentType: "application/pdf" },
            { filename: "logo-big.jpeg", content: logoBytes, cid: "logo-big" },
          ],
        });
      } catch (e) { console.error("Sub email failed", e); }
    }
    return { success: true };
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}
