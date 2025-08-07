import axios from "axios";

export async function GET() {
  try {
    const { data } = await axios.get(
      `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/published_posts`,
      {
        params: {
          fields: "id,created_time,message,full_picture",
          access_token: process.env.FACEBOOK_TOKEN,
        },
      }
    );
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
