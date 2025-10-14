import { z } from "zod";
import { settlementConsignmentFields } from "./fields";

export const settlementConsignmentSchema = z.object({
  oper_id: z.string().min(1, "기관명은 필수입니다"),
  stmtGrpId: z.string().min(1, "대안은 필수입니다"),
  lineCd: z.string().min(1, "노선코드는 필수입니다"),
  targetOperId: z.string().min(1, "대상기관은 필수입니다"),
});

export { settlementConsignmentFields };
