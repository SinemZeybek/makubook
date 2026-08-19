"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useTranslations } from "next-intl";
import { getCroppedImageFile } from "@/lib/cropImage";

export default function PhotoCropper({
  imageSrc,
  fileName,
  onCancel,
  onSave,
}: {
  imageSrc: string;
  fileName: string;
  onCancel: () => void;
  onSave: (file: File) => void;
}) {
  const t = useTranslations("RecipeForm");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleSave() {
    if (!croppedAreaPixels) return;
    setSaving(true);
    const file = await getCroppedImageFile(
      imageSrc,
      croppedAreaPixels,
      fileName
    );
    setSaving(false);
    onSave(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 p-4">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="mx-auto mt-4 flex w-full max-w-sm flex-col gap-3">
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-gold"
          aria-label={t("zoom")}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-cream/30 px-3 py-2 text-sm font-medium text-cream"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
            className="flex-1 rounded-md bg-gold px-3 py-2 text-sm font-medium text-berry disabled:opacity-50"
          >
            {saving ? t("saving") : t("saveCrop")}
          </button>
        </div>
      </div>
    </div>
  );
}
