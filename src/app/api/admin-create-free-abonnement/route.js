import admin from "@/lib/firebaseAdmin";
import { createTicketAndOrder } from "@/services/ticket.service";
import { generateAndSendTicketPDF } from "@/utils/generateAndSendTicketPDF";

export const runtime = "nodejs";
export const config = {
  api: { bodyParser: false },
  background: { maxDuration: 300 }, // keep it alive for up to 5 minutes
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-key",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("x-admin-key") || "";
    const adminKey = process.env.ADMIN_API_KEY || "my-super-secret-admin-key-2026";
    
    if (authHeader !== adminKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const body = await request.json();
    const { fullName, email, adminId } = body;

    if (!fullName || !email) {
      return new Response(JSON.stringify({ error: "Nom complet et adresse email requis" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    if (!adminId) {
      return new Response(JSON.stringify({ error: "Identifiant administrateur manquant" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // 1. Find or fallback to admin user
    let userId;
    let userData = null;
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      userId = userRecord.uid;
      
      const userRef = admin.firestore().collection("users").doc(userId);
      const userDoc = await userRef.get();
      userData = userDoc.exists ? userDoc.data() : { email, userName: fullName };
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // Fallback to the admin user who is creating this ticket
        userId = adminId;
        // The PDF still needs the buyer's full name and email to print and send correctly.
        userData = { email, userName: fullName };
      } else {
        throw error;
      }
    }

    // 2. Get the unique abonnement
    const abonementsSnapshot = await admin.firestore().collection("abonements").limit(1).get();
    if (abonementsSnapshot.empty) {
      return new Response(JSON.stringify({ error: "Aucun abonnement trouvé dans la base de données" }), { 
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    const abonnementId = abonementsSnapshot.docs[0].id;

    // 3. Create Ticket and Order (Amount = 0)
    const response = await createTicketAndOrder({
      userId,
      abonnementId,
      abonnementPrice: 0,
      quantity: 1,
      amount: 0,
      paymentIntentId: null,
      promoCodeId: null,
    });

    if (!response || !response.success) {
      return new Response(JSON.stringify({ error: "Erreur lors de la création de la commande" }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // 4. Generate PDF and send email
    if (response.data.abonnements?.length) {
      await generateAndSendTicketPDF(
        userData,
        [],
        response.data.order,
        response.data.abonnements
      );
    }

    return new Response(JSON.stringify({ success: true, data: response.data.orderId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating free abonnement:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
