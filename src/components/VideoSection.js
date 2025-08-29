"use client";

export default function VideoSection() {
  const src =
    "https://firebasestorage.googleapis.com/v0/b/billeterie-8c6e2.firebasestorage.app/o/VF%20-%20Lancement%20de%20l'équipe%20-%20Méga%20Toit%20x%20PP.mp4?alt=media&token=6c0e2b0b-fc99-4c69-963f-b7ee6f8ec1f8";

  return (
    <section className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Notre vidéo</h2>

      <div className="relative overflow-hidden rounded-2xl shadow">
        <video
          src={src}
          className="w-full h-auto"
          controls
          playsInline
          preload="metadata"
          // Optional UX niceties:
          muted
          autoPlay
          loop
          // poster="/poster.jpg"
          crossOrigin="anonymous"
        />
      </div>
    </section>
  );
}
