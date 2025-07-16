export interface Node {
  id: string;
  name: string;
  line: string;
  x: number;
  y: number;
  operator: string;
  consign_operator: number | null;
  open_date: number;
  gate_count: number | null;
  is_transfer: number;
  avg_stay_sec: number;
  avg_stay_sec_new: number;
  remarks: string | number | null;
}

export interface Link {
  source: string;
  target: string;
  line: string;
  time: number;
}
