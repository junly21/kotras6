import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouteSearchResult } from "@/types/routeSearch";

interface RouteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: RouteSearchResult | null;
}

export function RouteDetailDialog({
  open,
  onOpenChange,
  route,
}: RouteDetailDialogProps) {
  if (!route) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>상세 경로 정보</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">거리</h3>
              <p className="text-lg font-semibold">{route.km?.toFixed(1)}km</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                소요시간
              </h3>
              <p className="text-lg font-semibold">
                {Math.round((route.sta_pass_sec || 0) / 60)}분
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">요금</h3>
              <p className="text-lg font-semibold">
                {route.cost?.toLocaleString()}원
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">환승</h3>
              <p className="text-lg font-semibold">
                {route.transfer_cnt || 0}회
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">운영사</h3>
            <p className="text-base">{route.oper_list || "-"}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              전체 경로
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed">{route.path_nm || "-"}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">환승역</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {route.transfer_list && route.transfer_list !== "[]" ? (
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(route.transfer_list).map(
                    (transfer: string, index: number) => {
                      const stationName = transfer.match(
                        /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
                      )?.[1];
                      return (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {stationName || transfer}
                        </span>
                      );
                    }
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">환승역 없음</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
