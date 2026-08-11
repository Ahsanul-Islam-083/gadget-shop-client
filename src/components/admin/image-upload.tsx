"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast, dismissToast } from "@/components/admin/toast";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

const MAX_SIZE_MB = 5;
const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast(`Image must be under ${MAX_SIZE_MB} MB`, "error");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_API;
    if (!apiKey) {
      toast("Image upload API key is not configured", "error");
      return;
    }

    setUploading(true);
    const loadingId = toast("Uploading image…", "loading");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${IMGBB_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message ?? "Upload failed");
      }

      const url: string = json.data.url;
      onChange(url);
      dismissToast(loadingId);
      toast("Image uploaded successfully", "success");
    } catch (err) {
      dismissToast(loadingId);
      toast(err instanceof Error ? err.message : "Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value && (
        <div className="relative h-40 w-40 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
          <Image
            src={value}
            alt="Product image preview"
            fill
            unoptimized
            className="object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Drop zone */}
      {!disabled && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500 transition hover:border-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
        >
          {uploading ? (
            <span className="animate-pulse">Uploading…</span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              <span>
                {value ? "Replace image" : "Click or drag to upload"}
              </span>
              <span className="text-xs text-neutral-400">
                PNG, JPG, WEBP — max {MAX_SIZE_MB} MB
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={uploading || disabled}
        aria-label="Upload image"
      />

      {/* Fallback URL input for pasting a URL directly */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          Or paste URL:
        </span>
        <input
          type="url"
          placeholder="https://…"
          value={value ?? ""}
          disabled={uploading || disabled}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:border-neutral-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>
    </div>
  );
}
