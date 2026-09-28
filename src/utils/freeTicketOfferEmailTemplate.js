// Match Valleyfield vs Trois-Rivières
export const MATCH_URL = "https://bsr3r.com/calendrier/4Q5BGgqouxi0SdSuwxQu";
export const PROMO_CODE = "BSR43";
export const VALLEYFIELD_DATE = "Vendredi 2 octobre 2026 à 20 h";
export const BEDFORD_DATE = "Samedi 3 octobre 2026 à 19 h";

const BSR_LOGO =
  "https://firebasestorage.googleapis.com/v0/b/billeterie-8c6e2.firebasestorage.app/o/team-images%2F4e8d1be.png?alt=media&token=21c2b5e2-968b-424c-be02-62e913192334";
const VALLEYFIELD_LOGO =
  "https://firebasestorage.googleapis.com/v0/b/billeterie-8c6e2.firebasestorage.app/o/team-images%2Fdb6c12a1.png?alt=media&token=0ef3504c-6000-4574-9c42-8d09b6a09063";
const BEDFORD_LOGO =
  "https://firebasestorage.googleapis.com/v0/b/billeterie-8c6e2.firebasestorage.app/o/team-images%2Fe0434cc.png?alt=media&token=f0ac7964-25af-4516-929f-215b21f3b4d8";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const matchCard = (leftName, leftLogo, logoSize, nameSize, dateLabel) => `
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background:#1b1b1b;border-radius:8px;">
            <tr>
              <td align="center" valign="middle" width="45%" style="padding:20px 4px;">
                <img src="${leftLogo}" alt="Logo ${leftName}" width="${logoSize}" style="display:block;width:${logoSize}px;max-width:100%;height:auto;margin:0 auto 12px;">
                <strong style="color:#ffffff;font-size:${nameSize}px;line-height:1.4;">${leftName}</strong>
              </td>
              <td align="center" valign="middle" width="10%" style="color:#7bfd48;font-size:16px;font-weight:bold;white-space:nowrap;">VS</td>
              <td align="center" valign="middle" width="45%" style="padding:20px 4px;">
                <img src="${BSR_LOGO}" alt="Logo BSR Trois-Rivières" width="${logoSize}" style="display:block;width:${logoSize}px;max-width:100%;height:auto;margin:0 auto 12px;">
                <strong style="color:#ffffff;font-size:${nameSize}px;line-height:1.4;">Trois-Rivières</strong>
              </td>
            </tr>
            <tr>
              <td colspan="3" align="center" style="padding:0 8px 18px;color:#7bfd48;font-size:16px;font-weight:bold;">${dateLabel}</td>
            </tr>
          </table>`;

// "Week-end d'appréciation de nos fans" (BSR x Casse-Croûte Courteau), same
// weekend as both matches. The alt text carries the whole offer for mail
// clients that block images.
const FAN_WEEKEND_VISUAL =
  "https://firebasestorage.googleapis.com/v0/b/billeterie-8c6e2.firebasestorage.app/o/441ea70c-bb0d-448e-874c-f52ca667850b.jpeg?alt=media&token=634b034b-a625-46d6-bf84-bf6c027a5650";
const FAN_WEEKEND_ALT =
  "Week-end d'appréciation de nos fans, BSR x Casse-Croûte Courteau : vendredi 2 et samedi 3 octobre pendant les matchs, poutine, pogo, hot-dog, boisson gazeuse 591 ml et slush à 3 $ chacun. Colisée Jean-Guy-Talbot.";

const fanWeekendSection = () => `
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:20px;">
            <tr><td align="center">
              <a href="${MATCH_URL}" style="text-decoration:none;">
                <img src="${FAN_WEEKEND_VISUAL}" alt="${FAN_WEEKEND_ALT}" width="552" style="display:block;width:100%;max-width:552px;height:auto;border:0;border-radius:8px;color:#dddddd;font-size:14px;">
              </a>
            </td></tr>
          </table>`;

export function getFreeTicketOfferEmailTemplate(userName) {
  const name = userName ? ` <strong style="color:#7bfd48;">${escapeHtml(userName)}</strong>` : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offre spéciale BSR</title>
</head>
<body style="margin:0;padding:0;background:#000000;color:#ffffff;font-family:Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#000000;">
    <tr><td align="center" style="padding:24px 10px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#111111;border:1px solid #333333;border-radius:12px;">
        <tr><td align="center" style="padding:32px 20px 16px;">
          <p style="margin:0 0 8px;color:#7bfd48;font-size:14px;font-weight:bold;letter-spacing:2px;">OFFRE SPÉCIALE</p>
          <h1 style="margin:0;color:#ffffff;font-size:32px;line-height:1.2;">1 BILLET GRATUIT PAR BILLET ACHETÉ</h1>
        </td></tr>
        <tr><td style="padding:20px;">${matchCard("Valleyfield", VALLEYFIELD_LOGO, 80, 15, VALLEYFIELD_DATE)}
        </td></tr>
        <tr><td style="padding:4px 24px 32px;color:#dddddd;font-size:16px;line-height:1.6;">
          <p style="margin:0 0 14px;">Bonjour${name},</p>
          <p style="margin:0 0 20px;">Achetez vos billets pour le match <strong style="color:#ffffff;">Valleyfield vs Trois-Rivières</strong> avec le code promo ci-dessous et recevez automatiquement le même nombre de billets gratuits pour le match suivant à domicile :</p>
          ${matchCard("Bedford-Cowansville", BEDFORD_LOGO, 56, 14, BEDFORD_DATE)}
          <p style="margin:28px 0 0;color:#dddddd;">Et ce n’est pas tout : les deux matchs tombent pendant notre week-end d’appréciation des fans !</p>${fanWeekendSection()}
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:20px;background:#1b1b1b;border:1px solid #7bfd48;border-radius:8px;">
            <tr><td align="center" style="padding:18px 12px;">
              <span style="display:block;color:#ffffff;font-size:15px;">Votre code promo</span>
              <strong style="display:block;margin:6px 0;color:#7bfd48;font-size:30px;letter-spacing:3px;">${PROMO_CODE}</strong>
            </td></tr>
          </table>
          <p style="margin:20px 0 0;color:#dddddd;font-size:14px;">Les billets offerts sont ajoutés à votre commande et envoyés dans le même courriel.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 0;">
            <tr><td align="center" bgcolor="#7bfd48" style="border-radius:6px;color:#000000;">
              <a href="${MATCH_URL}" style="display:inline-block;padding:16px 24px;color:#000000 !important;font-size:18px;font-weight:bold;text-decoration:none;"><span style="color:#000000 !important;">ACHETER MES BILLETS</span></a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
