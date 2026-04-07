"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
};

export function ImageUpload({ currentUrl, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file);

    if (error) {
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(path);

    setPreview(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 overflow-hidden"
      >
        {preview ? (
          <img
            src={preview}
            alt="Product"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">
            {uploading ? "Uploading..." : "Click to upload"}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
