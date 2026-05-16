import { useEffect, useState } from "react";
import PixelButton from "./PixelButton";
import RetroCard from "./RetroCard";

export default function PhotoSubmission({
  challengeId,
  teamId,
  onSubmit,
  isSubmitting,
  disabled,
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file || disabled) {
      return;
    }

    const didSubmit = await onSubmit({
      challengeId,
      teamId,
      image: file,
    });

    if (didSubmit) {
      setFile(null);
    }
  };

  return (
    <RetroCard glow="green" className="space-y-5">
      <div>
        <h3 className="font-pixel text-[0.72rem] uppercase tracking-[0.18em] text-neonGreen">
          Photo Upload
        </h3>
        <p className="mt-3 text-sm leading-6 text-zinc-300 sm:text-base">
          Snap the moment, upload it here, and lock in your team entry.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-3 block font-pixel text-[0.58rem] uppercase tracking-[0.18em] text-zinc-400">
            Pick Image
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-300 file:mb-3 file:mr-0 file:block file:w-full file:cursor-pointer file:border-0 file:bg-neonPink file:px-4 file:py-3 file:font-pixel file:text-[0.56rem] file:uppercase file:tracking-[0.16em] file:text-void sm:file:mb-0 sm:file:mr-4 sm:file:inline-block sm:file:w-auto sm:file:text-[0.6rem]"
          />
        </label>

        <div className="pixel-corners overflow-hidden rounded-2xl border-4 border-borderGlow bg-void/80">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected preview"
              className="h-48 w-full object-cover sm:h-56 lg:h-64"
            />
          ) : (
            <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-zinc-500 sm:h-56 lg:h-64">
              Your preview appears here once you choose an image.
            </div>
          )}
        </div>

        <PixelButton
          type="submit"
          variant="secondary"
          disabled={disabled || isSubmitting || !file}
          className="w-full"
        >
          {isSubmitting ? "Uploading..." : "Submit Photo"}
        </PixelButton>
      </form>
    </RetroCard>
  );
}
