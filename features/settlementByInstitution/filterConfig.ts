import { z } from "zod";
import { settlementByInstitutionFields } from "./fields";

export const settlementByInstitutionSchema = z.object({
  agency: z.string().min(1, "기관명은 필수입니다"),
});

export { settlementByInstitutionFields };
