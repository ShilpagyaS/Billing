export interface GemCertificate {
  certificateNo: string;
  variety: string;
  weight: string;
  color: string;
  shapeAndCut: string;
  measurement: string;
  specificGravity: string;
  comment: string;
  gemmologist: string;
  gemImageUrl?: string;
}

export interface FormField {
  key: keyof GemCertificate;
  label: string;
  placeholder: string;
  required?: boolean;
}
