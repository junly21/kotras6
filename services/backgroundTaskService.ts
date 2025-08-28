import { MockSettlementRegisterFormData } from "@/types/mockSettlementRegister";
import { useBackgroundTaskStore } from "@/store/backgroundTaskStore";
import { useGlobalToastStore } from "@/store/globalToastStore";

export class BackgroundTaskService {
  private static monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  // 백그라운드에서 모의정산 등록 실행
  static async executeMockSettlementRegistration(
    formData: MockSettlementRegisterFormData
  ) {
    const taskId = `register_${Date.now()}`;

    // 전역 상태에 작업 추가
    useBackgroundTaskStore.getState().addTask({
      id: taskId,
      type: "mockSettlementRegister",
      status: "pending",
      startTime: Date.now(),
      data: formData,
    });

    try {
      // 브라우저 타임아웃 방지를 위한 설정 (25분)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25 * 60 * 1000);

      // 모의정산 등록 API 호출
      const response = await fetch("/api/mock-settlement/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          data: formData,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("모의정산 등록 API 응답:", result);

      // 다양한 응답 형식 처리
      const isSuccess =
        result.success === true ||
        result.status === "ok" ||
        result.status === "success" ||
        (result.data && result.data.status === "ok");

      if (isSuccess) {
        // 성공 시 작업 상태 업데이트
        const successMessage =
          result.message || "모의정산 등록이 완료되었습니다.";
        useBackgroundTaskStore
          .getState()
          .updateTaskStatus(taskId, "success", successMessage);

        // 전역 토스트 표시
        useGlobalToastStore.getState().showToast({
          message: successMessage,
          type: "success",
          duration: 5000,
        });
      } else {
        // 실패 시 작업 상태 업데이트
        const errorMessage =
          result.error || result.message || "모의정산 등록에 실패했습니다.";
        useBackgroundTaskStore
          .getState()
          .updateTaskStatus(taskId, "error", errorMessage);

        // 전역 토스트 표시
        useGlobalToastStore.getState().showToast({
          message: errorMessage,
          type: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // 타임아웃 발생 시 백그라운드 모니터링 시작
        console.log(
          "모의정산 등록 타임아웃, 백그라운드 모니터링 시작:",
          taskId
        );
        useBackgroundTaskStore
          .getState()
          .updateTaskStatus(
            taskId,
            "processing",
            "모의정산 등록이 진행 중입니다. 백그라운드에서 모니터링합니다."
          );

        // 백그라운드 모니터링 시작
        this.startBackgroundMonitoring(taskId, formData);

        // 전역 토스트 표시
        useGlobalToastStore.getState().showToast({
          message: "모의정산 등록이 백그라운드에서 진행 중입니다.",
          type: "info",
          duration: 5000,
        });
      } else {
        // 다른 에러 처리
        console.error("모의정산 등록 에러:", error);
        useBackgroundTaskStore
          .getState()
          .updateTaskStatus(
            taskId,
            "error",
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다."
          );

        // 전역 토스트 표시
        useGlobalToastStore.getState().showToast({
          message:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
          type: "error",
          duration: 5000,
        });
      }
    }
  }

  // 백그라운드에서 상태 모니터링
  private static startBackgroundMonitoring(
    taskId: string,
    formData: MockSettlementRegisterFormData
  ) {
    // 이미 모니터링 중인 경우 중복 시작 방지
    if (this.monitoringIntervals.has(taskId)) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        console.log("백그라운드 모니터링 실행:", taskId);

        // 모의정산 상태 확인 API 호출
        const statusResponse = await fetch(
          "/api/mock-settlement/check-status",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              settlementName: formData.settlementName,
              tradeDate: formData.tradeDate,
            }),
          }
        );

        if (!statusResponse.ok) {
          throw new Error(`HTTP error! status: ${statusResponse.status}`);
        }

        const statusResult = await statusResponse.json();

        if (statusResult.success && statusResult.data) {
          if (statusResult.completed) {
            // 완료된 경우
            clearInterval(intervalId);
            this.monitoringIntervals.delete(taskId);

            useBackgroundTaskStore
              .getState()
              .updateTaskStatus(
                taskId,
                "success",
                "모의정산 등록이 완료되었습니다."
              );

            // 전역 토스트 표시
            useGlobalToastStore.getState().showToast({
              message: "모의정산 등록이 완료되었습니다.",
              type: "success",
              duration: 5000,
            });
          } else {
            // 진행 중인 경우 상태 업데이트
            useBackgroundTaskStore
              .getState()
              .updateTaskStatus(
                taskId,
                "processing",
                `모의정산 등록이 진행 중입니다. (${new Date().toLocaleTimeString()})`
              );
          }
        }
      } catch (error) {
        console.error("백그라운드 모니터링 에러:", error);
        // 에러가 발생해도 모니터링 계속 진행
      }
    }, 30000); // 30초마다 확인

    // 모니터링 인터벌 저장
    this.monitoringIntervals.set(taskId, intervalId);
  }

  // 모니터링 중단
  static stopMonitoring(taskId: string) {
    const intervalId = this.monitoringIntervals.get(taskId);
    if (intervalId) {
      clearInterval(intervalId);
      this.monitoringIntervals.delete(taskId);
    }
  }

  // 모든 모니터링 중단
  static stopAllMonitoring() {
    for (const [taskId, intervalId] of this.monitoringIntervals.entries()) {
      clearInterval(intervalId);
    }
    this.monitoringIntervals.clear();
  }
}
