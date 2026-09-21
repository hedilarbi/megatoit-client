const MATCH_URL = "https://bsr3r.com/calendrier/ov2dS6VfPr7gWRd812sA";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

export function getOpeningMatchEmailTemplate(userName) {
  const name = escapeHtml(userName);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Match d’ouverture BSR</title>
</head>
<body style="margin:0;padding:0;background:#000000;color:#ffffff;font-family:Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#000000;">
    <tr><td align="center" style="padding:24px 10px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#111111;border:1px solid #333333;border-radius:12px;">
        <tr><td align="center" style="padding:32px 20px 16px;">
          <p style="margin:0 0 8px;color:#7bfd48;font-size:14px;font-weight:bold;letter-spacing:2px;">SAISON 2026-27</p>
          <h1 style="margin:0;color:#ffffff;font-size:32px;line-height:1.2;">MATCH D’OUVERTURE</h1>
          <p style="margin:14px 0 0;color:#dddddd;font-size:18px;">Vendredi 25 septembre 2026 à 20 h</p>
        </td></tr>
        <tr><td style="padding:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background:#1b1b1b;border-radius:8px;">
            <tr>
              <td align="center" valign="middle" width="45%" style="padding:20px 4px;">
                <img src="cid:st-lambert-logo" alt="Logo St-Lambert-de-Lauzon" width="80" style="display:block;width:80px;max-width:100%;height:auto;margin:0 auto 12px;">
                <strong style="color:#ffffff;font-size:15px;line-height:1.4;">St-Lambert-de-Lauzon</strong>
              </td>
              <td align="center" valign="middle" width="10%" style="color:#7bfd48;font-size:16px;font-weight:bold;white-space:nowrap;">VS</td>
              <td align="center" valign="middle" width="45%" style="padding:20px 4px;">
                <img src="https://bsr3r.com/logo-big.jpeg" alt="Logo BSR Trois-Rivières" width="80" style="display:block;width:80px;max-width:100%;height:auto;margin:0 auto 12px;">
                <strong style="color:#ffffff;font-size:15px;line-height:1.4;">BSR Trois-Rivières</strong>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:4px 24px 32px;color:#dddddd;font-size:16px;line-height:1.6;">
          <p style="margin:0 0 14px;">Bonjour <strong style="color:#7bfd48;">${name}</strong>,</p>
          <p style="margin:0 0 20px;">La saison commence bientôt ! Réservez votre place pour encourager le BSR Trois-Rivières lors du match d’ouverture.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#1b1b1b;border:1px solid #7bfd48;border-radius:8px;">
            <tr><td align="center" style="padding:18px 12px;">
              <strong style="display:block;color:#7bfd48;font-size:26px;">50 % de rabais</strong>
              <span style="display:block;color:#ffffff;font-size:15px;">Utilisez le code promo <strong>BSR50</strong> à l’achat de votre billet.</span>
            </td></tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 0;">
            <tr><td align="center" bgcolor="#7bfd48" style="border-radius:6px;color:#000000;">
              <a href="${MATCH_URL}" style="display:inline-block;padding:16px 24px;color:#000000 !important;font-size:18px;font-weight:bold;text-decoration:none;"><span style="color:#000000 !important;">ACHETER MON BILLET</span></a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
