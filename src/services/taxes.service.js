import { db } from "@/lib/firebase";

import { collection, getDocs } from "firebase/firestore";

export const getAllTaxes = async () => {
  try {
    const taxesCollection = collection(db, "taxes");
    const taxesSnapshot = await getDocs(taxesCollection);
    const taxes = taxesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return {
      success: true,
      data: taxes,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des taxes :", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des taxes",
    };
  }
};
