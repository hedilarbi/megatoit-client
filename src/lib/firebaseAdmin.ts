const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
const BUCKET = "gs://billeterie-d9233.firebasestorage.app";
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: BUCKET,
  });
}

export default admin;
