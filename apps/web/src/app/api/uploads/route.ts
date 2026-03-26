import { NextResponse } from "next/server";

import { runtimeConfig } from "@/lib/platform";
import { PublicRouteError, assertRateLimit, buildSafeFileName } from "@/lib/security";
import { getServiceSupabaseClient } from "@/lib/supabase/service";

const uploadTargets = {
  "request-photo": {
    bucket: "request-photos",
    public: false,
    prefix: "requests",
  },
  "company-asset": {
    bucket: "company-assets",
    public: true,
    prefix: "companies",
  },
  "blog-asset": {
    bucket: "blog-assets",
    public: true,
    prefix: "blog",
  },
} as const;

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "asset-upload", { limit: 20, windowMs: 60_000 });

    const formData = await request.formData();
    const kind = formData.get("kind");
    const file = formData.get("file");

    if (typeof kind !== "string" || !(kind in uploadTargets) || !(file instanceof File)) {
      throw new PublicRouteError("Neplatná požiadavka na upload.", 400);
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new PublicRouteError("Podporované sú len PNG, JPG a WEBP súbory.", 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new PublicRouteError("Maximálna veľkosť súboru je 10 MB.", 400);
    }

    const target = uploadTargets[kind as keyof typeof uploadTargets];
    const fileName = buildSafeFileName(file.name || "asset");
    const path = `${target.prefix}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${fileName}`;

    const supabase = getServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        bucket: target.bucket,
        path: `local://${path}`,
        publicUrl: target.public ? `/${path}` : undefined,
      });
    }

    const { error } = await supabase.storage
      .from(target.bucket)
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({
        bucket: target.bucket,
        path: `local://${path}`,
        publicUrl: target.public ? `/${path}` : undefined,
        warning: error.message,
      });
    }

    return NextResponse.json({
      bucket: target.bucket,
      path,
      ...(target.public
        ? {
            publicUrl: `${runtimeConfig.supabaseUrl}/storage/v1/object/public/${target.bucket}/${path}`,
          }
        : {}),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload sa nepodarilo spracovať.",
      },
      { status: error instanceof PublicRouteError ? error.status : 500 },
    );
  }
}
