import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
 
// POST /api/certificates — save a new certificate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      certificateNo,
      variety,
      weight,
      color,
      shapeAndCut,
      measurement,
      specificGravity,
      comment,
      gemmologist,
      gemImageUrl,
    } = body;
 
    if (!certificateNo || !variety || !weight) {
      return NextResponse.json(
        { error: "Certificate No., Variety and Weight are required." },
        { status: 400 }
      );
    }
 
    const origin = req.headers.get("origin") || "https://cert.rajagemstones.com";
    const certNoClean = certificateNo.trim().toUpperCase();
 
    const record = {
      certificate_no: certNoClean,
      variety: variety.trim().toUpperCase(),
      weight: weight.trim(),
      color: color?.trim().toUpperCase() || "",
      shape_and_cut: shapeAndCut?.trim().toUpperCase() || "",
      measurement: measurement?.trim() || "",
      specific_gravity: specificGravity?.trim() || "",
      comment: comment?.trim().toUpperCase() || "",
      gemmologist: gemmologist?.trim().toUpperCase() || "AKASH SONI",
      gem_image_url: gemImageUrl || null,
      card_image_url: `${origin}/verify/${certNoClean}`,
      created_at: new Date().toISOString(),
    };
 
    // Try insert first
    const { error: insertError } = await supabase
      .from("certificates")
      .insert(record);
 
    if (insertError) {
      // If duplicate cert number, do an update instead
      if (insertError.code === "23505") {
        const { error: updateError } = await supabase
          .from("certificates")
          .update(record)
          .eq("certificate_no", record.certificate_no);
 
        if (updateError) {
          console.error("Supabase update error:", updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      } else {
        console.error("Supabase insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }
 
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
 
// GET /api/certificates?cert=RG119903 — fetch one certificate
export async function GET(req: NextRequest) {
  const certNo = req.nextUrl.searchParams.get("cert");
 
  if (!certNo) {
    return NextResponse.json({ error: "cert parameter required" }, { status: 400 });
  }
 
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_no", certNo.trim().toUpperCase())
    .single();
 
  if (error || !data) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }
 
  return NextResponse.json({ data }, { status: 200 });
}
