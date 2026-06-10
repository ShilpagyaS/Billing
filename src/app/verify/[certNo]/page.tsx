import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import VerifyClient from "./VerifyClient";

interface Props {
  params: { certNo: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Certificate ${decodeURIComponent(params.certNo)} — Raja Gems Testing Lab`,
    description: "Verified gemstone certificate from Raja Gems Testing Lab, Jabalpur (M.P.)",
  };
}

async function getCertificate(certNo: string) {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_no", decodeURIComponent(certNo).trim().toUpperCase())
    .single();

  if (error || !data) return null;
  return data;
}

export default async function VerifyPage({ params }: Props) {
  const cert = await getCertificate(params.certNo);
  return <VerifyClient cert={cert} certNo={decodeURIComponent(params.certNo)} />;
}
