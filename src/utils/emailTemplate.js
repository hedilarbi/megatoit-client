export const getSeasonOfferEmailTemplate = (userName, baseUrl) => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  /* Reset styles for email clients */
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  /* Basic styles */
  body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #000000; }
  a { text-decoration: none; }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; min-height: 100vh;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000; min-height: 100vh;">
    <tr>
      <td align="center" valign="top" style="padding: 20px 5px;">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #111111; border-radius: 12px; border: 1px solid #333333; margin: 0 auto;">
          <tr>
            <td align="center" style="padding: 30px 15px;">
              <img src="${baseUrl}/logo-big.jpeg" alt="BSR" style="width: 90px; max-width: 90px; display: block; border: 0; margin-bottom: 20px;" />
              
              <h1 style="font-family: 'Bebas Neue', Impact, Arial, sans-serif; font-size: 32px; text-transform: uppercase; margin: 0 0 5px 0; font-weight: normal; letter-spacing: 1px; color: #ffffff;">
                OFFRE BILLET DE SAISON <span style="color: #7bfd48;">2026-27</span>
              </h1>
              
              <h2 style="font-family: 'Bebas Neue', Impact, Arial, sans-serif; font-size: 24px; text-transform: uppercase; margin: 0 0 25px 0; font-weight: normal; color: #e5e5e5;">
                SOYEZ AU CŒUR DE L’ACTION
              </h2>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="font-family: 'Lato', Arial, sans-serif; padding-bottom: 30px;">
                    <p style="font-size: 16px; margin: 0 0 15px 0; color: #ffffff;">
                      Bonjour <strong style="color: #7bfd48;">${userName}</strong>,
                    </p>
                    
                    <p style="font-size: 15px; margin: 0 0 15px 0; line-height: 1.6; color: #cccccc;">
                      La saison 2026-27 approche à grands pas ! C'est le moment idéal pour vous procurer votre <strong>billet de saison</strong>.
                    </p>

                    <!-- Bloc de l'offre promotionnelle (Prix et validité) -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px; border: 1px solid #7bfd48; border-radius: 8px; background-color: #1a1a1a;">
                      <tr>
                        <td align="center" style="padding: 15px 10px; font-family: 'Lato', Arial, sans-serif;">
                          <p style="margin: 0 0 10px 0; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; color: #cccccc;">
                            Tarif de prévente
                          </p>
                          <p style="margin: 0 0 5px 0; font-size: 24px; color: #7bfd48; font-weight: bold; font-family: 'Bebas Neue', Impact, Arial, sans-serif; letter-spacing: 1px;">
                            Seulement 135$ <span style="color: #888888; text-decoration: line-through; font-size: 16px; font-weight: normal;">(au lieu de 165$)</span>
                          </p>
                          <p style="margin: 0; font-size: 13px; color: #ff5555; font-style: italic;">
                            *Offre valable uniquement jusqu'au <strong>13 septembre 2026</strong>.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Bloc des avantages de l'abonnement -->
                    <h3 style="font-size: 16px; color: #ffffff; margin: 0 0 10px 0; border-bottom: 1px solid #333333; padding-bottom: 5px;">
                      Ce que contient votre billet de saison :
                    </h3>
                    <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #cccccc; font-size: 14px; line-height: 1.6;">
                      <li style="margin-bottom: 5px;"><strong>13 matchs de saison régulière</strong> pour vibrer à chaque rencontre.</li>
                      <li style="margin-bottom: 5px;"><strong>1 match présaison inclus</strong> pour découvrir vos joueurs dès le début.</li>
                    </ul>
                    
                    <p style="font-size: 15px; margin: 0 0 30px 0; line-height: 1.6; color: #cccccc;">
                      Ne manquez pas cette opportunité de rejoindre la famille BSR. L'action n'attend plus que vous !
                    </p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" bgcolor="#7bfd48" style="border-radius: 6px; padding: 15px 30px;">
                                <a href="${baseUrl}/#abonnement" style="font-family: 'Bebas Neue', Impact, Arial, sans-serif; font-size: 22px; color: #000000; text-decoration: none; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; display: inline-block; mso-padding-alt: 0;">
                                  RÉSERVER MON ABONNEMENT
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
