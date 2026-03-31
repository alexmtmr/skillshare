"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Camera, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImagesStepProps {
  images: string[];
  onChange: (urls: string[]) => void;
}

export function ImagesStep({ images, onChange }: ImagesStepProps) {
  const t = useTranslations("posts");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 5 - images.length;
    const filesToUpload = Array.from(files).slice(0, remaining);

    setUploading(true);
    setUploadError("");
    const supabase = createClient();
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(fileName, file, { contentType: file.type });

      if (error) {
        setUploadError(`Upload failed: ${error.message}`);
      } else {
        const { data } = supabase.storage.from("images").getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      }
    }

    onChange([...images, ...newUrls]);
    setUploading(false);

    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-primary mb-2">
        Add photos
      </h2>
      <p className="text-sm text-text-secondary mb-4">{t("imagesHelp")}</p>

      {uploadError && (
        <p className="text-sm text-accent mb-3">{uploadError}</p>
      )}

      {/* Image grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {images.map((url, i) => (
          <div
            key={url}
            className="relative aspect-square rounded-md overflow-hidden border border-divider"
          >
            <img
              src={url}
              alt={`Upload ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 p-0.5 bg-primary/70 rounded-full text-white hover:bg-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Upload button */}
      {images.length < 5 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full py-8 border-2 border-dashed border-divider rounded-lg flex flex-col items-center gap-2 text-text-secondary hover:border-secondary hover:text-secondary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Camera className="w-6 h-6" />
          )}
          <span className="text-sm font-medium">
            {uploading ? "Uploading..." : t("addPhotos")}
          </span>
          <span className="text-xs">
            {images.length}/5 photos
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </Card>
  );
}
