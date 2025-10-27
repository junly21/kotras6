import { FieldConfig } from "@/types/filterForm";

export const settlementByStationFilterConfig: FieldConfig[] = [
  {
    name: "STN_ID1",
    label: "선택역1",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: true,
    optionsEndpoint: "/api/selectNetWorkNodeSelectBoxSession",
  },
  {
    name: "STN_ID2",
    label: "선택역2",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: false,
    optionsEndpoint: "/api/selectNetWorkNodeSelectBoxSession",
    dependsOn: "STN_ID1", // STN_ID1이 선택되어야 활성화
  },
  {
    name: "STN_ID3",
    label: "선택역3",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: false,
    optionsEndpoint: "/api/selectNetWorkNodeSelectBoxSession",
    dependsOn: "STN_ID2", // STN_ID2가 선택되어야 활성화
  },
  {
    name: "STN_ID4",
    label: "선택역4",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: false,
    optionsEndpoint: "/api/selectNetWorkNodeSelectBoxSession",
    dependsOn: "STN_ID3", // STN_ID3이 선택되어야 활성화
  },
  {
    name: "STN_ID5",
    label: "선택역5",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: false,
    optionsEndpoint: "/api/selectNetWorkNodeSelectBoxSession",
    dependsOn: "STN_ID4", // STN_ID4가 선택되어야 활성화
  },
  // {
  //   name: "stmtGrpId",
  //   label: "대안",
  //   type: "select",
  //   required: true,
  //   placeholder: "대안을 선택하세요",
  //   optionsEndpoint: "/api/stmt_grp_id",
  // },
];
