"use client";
export default function VideoSection() {
  const src =
    "https://firebasestorage.googleapis.com/v0/b/billeterie-8c6e2.firebasestorage.app/o/LEMEGATOIT.mp4?alt=media&token=6fc4083e-b62a-494b-ae75-75b70e0bdce5";

  return (
    <div className=" overflow-hidden shadow rounded-lg">
      <video
        src={src}
        className="w-full h-auto"
        controls
        playsInline
        // Optional UX niceties:
        muted
        autoPlay
        loop
        preload="auto"
        poster="/logo-big.png"
        //crossOrigin="anonymous"
      />
    </div>
  );
}
