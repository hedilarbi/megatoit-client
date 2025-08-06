import { NextResponse } from "next/server";

export async function GET() {
  const redirectUri = encodeURIComponent(
    `${process.env.BASE_URL}/api/facebook/callback`
  );

  const scopes = ["pages_read_engagement", "pages_read_user_content"].join(",");

  const fbAuthUrl =
    `https://www.facebook.com/v15.0/dialog/oauth` +
    `?client_id=${process.env.FACEBOOK_APP_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scopes}` +
    `&response_type=code`;

  return NextResponse.redirect(fbAuthUrl);
}
