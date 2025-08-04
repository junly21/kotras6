"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimulateModal({ isOpen, onClose }: SimulateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>모의정산 시작</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700 text-center">
            모의정산을 시작합니다. 완료까지 10분 정도 소요됩니다.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="px-8">
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
