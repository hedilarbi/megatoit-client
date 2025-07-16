import { db } from "@/lib/firebase";

import { TaxeData } from "@/types/taxe";
import { collection, getDocs } from "firebase/firestore";

export const getAllTaxes = async () => {
  try {
    const taxesCollection = collection(db, "taxes");
    const taxesSnapshot = await getDocs(taxesCollection);
    const taxes: TaxeData[] = taxesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TaxeData[];
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
