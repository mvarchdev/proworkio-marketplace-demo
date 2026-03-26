"use client";

export interface UploadedAsset {
  bucket: string;
  path: string;
  publicUrl?: string;
  altText?: string;
}

export async function uploadMarketplaceAsset(
  file: File,
  kind: "request-photo" | "company-asset" | "blog-asset",
) {
  const body = new FormData();
  body.append("kind", kind);
  body.append("file", file);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body,
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        bucket?: string;
        path?: string;
        publicUrl?: string;
        error?: string;
      }
    | null;

  if (!response.ok || !payload?.bucket || !payload.path) {
    throw new Error(payload?.error ?? "Súbor sa nepodarilo nahrať.");
  }

  return {
    bucket: payload.bucket,
    path: payload.path,
    altText: file.name,
    ...(payload.publicUrl ? { publicUrl: payload.publicUrl } : {}),
  } satisfies UploadedAsset;
}

