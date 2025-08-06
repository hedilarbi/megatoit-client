import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectUri = `${process.env.BASE_URL}/api/facebook/callback`;

  if (!code) {
    return new NextResponse("Code manquant", { status: 400 });
  }

  // 1) Court‐lived user token
  const res1 = await fetch(
    `https://graph.facebook.com/v15.0/oauth/access_token` +
      `?client_id=${process.env.FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
      `&code=${code}`
  );
  const { access_token: shortToken } = await res1.json();

  // 2) Long‐lived user token
  const res2 = await fetch(
    `https://graph.facebook.com/v15.0/oauth/access_token` +
      `?grant_type=fb_exchange_token` +
      `&client_id=${process.env.FACEBOOK_APP_ID}` +
      `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
      `&fb_exchange_token=${shortToken}`
  );
  const { access_token: longToken } = await res2.json();

  // 3) Page access token
  const res3 = await fetch(
    `https://graph.facebook.com/v15.0/me/accounts?access_token=${longToken}`
  );
  const { data: pages } = await res3.json();
  const page = pages.find((p) => p.id === process.env.FACEBOOK_PAGE_ID);
  if (!page) {
    return new NextResponse("Page introuvable ou pas admin", { status: 404 });
  }
  //const pageToken = page.access_token;

  // 4) Sauvegardez `pageToken` en base ou secret manager
  //    Ex. : await savePageToken(pageToken);

  return new NextResponse(
    "✅ Facebook configuré avec succès. Vous pouvez fermer cette fenêtre."
  );
}
