import { z } from "zod";
import { settlementByInstitutionFields } from "./fields";

export const settlementByInstitutionSchema = z.object({
  agency: z.string().optional(),
});

export { settlementByInstitutionFields };
