// app/remboursement/page.tsx
import React from "react";

const RemboursementPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800 pb-20">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Politique de remboursement
      </h1>
      <p className="text-sm text-gray-500 mb-8 text-center">
        Dernière mise à jour : 13 juillet 2025
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            1. Billets non remboursables
          </h2>
          <p>
            Tous les billets vendus pour les matchs de <strong>BSR DE TROIS-RIVIÈRES</strong>{" "}
            à Trois-Rivières sont <strong>non remboursables</strong> et{" "}
            <strong>non échangeables</strong>, sauf cas spécifiques mentionnés
            ci-dessous.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            2. Annulation ou report de match
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Annulation définitive :</strong> remboursement complet ou
              crédit équivalent pour un autre match.
            </li>
            <li>
              <strong>Report :</strong> le billet reste valide pour la nouvelle
              date. Remboursement possible si l’acheteur ne peut pas y assister
              (preuve requise).
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            3. Conditions météorologiques
          </h2>
          <p>
            Les matchs ont lieu quelles que soient les conditions météo. Aucun
            remboursement ne sera accordé sauf si le match est annulé par
            l’organisation.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            4. Problèmes techniques ou erreurs de commande
          </h2>
          <p>
            En cas de problème technique ou erreur lors de l’achat, veuillez
            nous contacter dans les 24 heures :
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              📧 <strong>info@bsr3r.com</strong>
            </li>
            <li>
              📞 <strong>1 (819) 123-4567</strong>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">5. Revente interdite</h2>
          <p>
            La revente de billets à un prix supérieur à leur valeur nominale est
            interdite. Les billets obtenus frauduleusement peuvent être annulés
            sans préavis ni remboursement.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            6. Produits et services additionnels
          </h2>
          <p>
            Les articles comme la nourriture, le stationnement ou les services
            VIP achetés en supplément ne sont pas remboursables, sauf si le
            match est annulé.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">7. Contact</h2>
          <p>Pour toute question concernant la billetterie :</p>
          <ul className="list-disc list-inside mt-2">
            <li>
              📍 1740 Av. Gilles-Villeneuve, Trois-Rivières, QC G8Y 7B6, Canada
            </li>
            <li>📧 info@bsr3r.com</li>
            <li>📞 1 (819) 123-4567</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Cette politique est conforme aux lois en vigueur au Québec et au
          Canada.
        </p>
      </section>
    </div>
  );
};

export default RemboursementPage;
