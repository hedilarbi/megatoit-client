export default function VideoSection() {
  const src =
    "https://firebasestorage.googleapis.com/v0/b/billeterie-8c6e2.firebasestorage.app/o/LEMEGATOIT.mp4?alt=media&token=710d59fe-05d7-4dbf-8d6f-dca57ca8aaeb";

  return (
    <div className=" overflow-hidden shadow rounded-lg">
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
        //crossOrigin="anonymous"
      />
    </div>
  );
}
