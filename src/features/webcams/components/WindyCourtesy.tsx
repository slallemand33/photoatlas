export function WindyCourtesy() {
  return (
    <p className="text-muted-foreground/55 text-[10px] leading-relaxed">
      Webcams fournies par{" "}
      <a
        href="https://www.windy.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground underline underline-offset-2"
      >
        Windy.com
      </a>{" "}
      ·{" "}
      <a
        href="https://www.windy.com/webcams/add"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground underline underline-offset-2"
      >
        Ajouter une webcam
      </a>
    </p>
  );
}
