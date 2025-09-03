import { MockSettlementRegisterFormData } from "@/types/mockSettlementRegister";
import { useBackgroundTaskStore } from "@/store/backgroundTaskStore";
import { useGlobalToastStore } from "@/store/globalToastStore";

export class BackgroundTaskService {
  private static monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private static isInitialized = false;

  // 백그라운드에서 모의정산 등록 실행
  static async executeMockSettlementRegistration(
    formData: MockSettlementRegisterFormData
  ) {
    const taskId = `register_${Date.now()}`;

    // 현재 작업 설정
    console.log("작업 시작:", { taskId, formData });
    useBackgroundTaskStore.getState().setCurrentTask({
      id: taskId,
      type: "mockSettlementRegister",
      status: "pending",
      startTime: Date.now(),
      data: formData,
    });

    // beforeunload 이벤트는 제거 - 새로고침 시 에러 발생 방지

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
        // 성공 시 작업 완료 및 정리
        const successMessage =
          result.message || "모의정산 등록이 완료되었습니다.";

        // 작업 완료 후 정리
        useBackgroundTaskStore.getState().clearCurrentTask();

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

        // 등록 중단으로 인한 에러인지 확인
        const isForcedStop = errorMessage.includes(
          "관리자 요청에 의해서 연결을 끝냅니다"
        );

        if (isForcedStop) {
          // 등록 중단으로 인한 에러는 토스트 표시하지 않고 상태창도 꺼버림
          useBackgroundTaskStore.getState().clearCurrentTask();
        } else {
          // 실제 에러인 경우에만 토스트 표시
          useBackgroundTaskStore
            .getState()
            .updateTaskStatus("error", errorMessage);

          // 전역 토스트 표시
          useGlobalToastStore.getState().showToast({
            message: errorMessage,
            type: "error",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.message === "Failed to fetch")
      ) {
        // AbortError나 Failed to fetch는 새로고침이나 타임아웃으로 인한 정상적인 중단
        console.log(
          "모의정산 등록 요청이 중단됨 (새로고침 또는 타임아웃):",
          taskId,
          "에러 타입:",
          error.name,
          "에러 메시지:",
          error.message
        );

        // 작업 상태를 processing으로 변경하고 백그라운드 모니터링 시작
        useBackgroundTaskStore
          .getState()
          .updateTaskStatus("processing", "모의정산 등록이 진행 중입니다.");

        // 백그라운드 모니터링 시작
        this.startBackgroundMonitoring(taskId);

        // 전역 토스트 표시 (새로고침 시에는 토스트가 표시되지 않을 수 있음)
        try {
          useGlobalToastStore.getState().showToast({
            message: "모의정산 등록이 진행 중입니다.",
            type: "info",
            duration: 5000,
          });
        } catch (toastError) {
          console.log("토스트 표시 실패 (새로고침 중):", toastError);
        }
      } else {
        // 실제 에러 처리
        console.log("모의정산 등록 에러:", error);
        console.log("에러 타입:", error?.constructor?.name);
        console.log(
          "에러 스택:",
          error instanceof Error ? error.stack : "No stack"
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";

        // 등록 중단으로 인한 에러인지 확인
        const isForcedStop = errorMessage.includes(
          "관리자 요청에 의해서 연결을 끝냅니다"
        );

        if (isForcedStop) {
          // 등록 중단으로 인한 에러는 토스트 표시하지 않고 상태창도 꺼버림
          useBackgroundTaskStore.getState().clearCurrentTask();
        } else {
          // 실제 에러인 경우에만 토스트 표시
          useBackgroundTaskStore
            .getState()
            .updateTaskStatus("error", errorMessage);

          // 전역 토스트 표시
          useGlobalToastStore.getState().showToast({
            message: errorMessage,
            type: "error",
            duration: 5000,
          });
        }
      }
    }
  }

  // 백그라운드에서 상태 모니터링
  private static startBackgroundMonitoring(taskId: string) {
    // 이미 모니터링 중인 경우 중복 시작 방지
    if (this.monitoringIntervals.has(taskId)) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        // 모니터링이 중단되었는지 확인
        if (!this.monitoringIntervals.has(taskId)) {
          console.log("모니터링이 중단되어 종료:", taskId);
          return;
        }

        console.log("백그라운드 모니터링 실행:", taskId);

        // 모의정산 실행 상태 확인 API 호출
        const statusResponse = await fetch("/api/mock-settlement/is-running", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!statusResponse.ok) {
          throw new Error(`HTTP error! status: ${statusResponse.status}`);
        }

        const statusResult = await statusResponse.json();

        if (statusResult.success && statusResult.data) {
          // 실행 중인 모의정산이 있는지 확인
          const isRunning =
            Array.isArray(statusResult.data) &&
            statusResult.data.some(
              (item: { state: string }) => item.state === "active"
            );

          if (!isRunning) {
            // 실행 중인 모의정산이 없으면 완료된 것으로 간주
            clearInterval(intervalId);
            this.monitoringIntervals.delete(taskId);

            // 작업 완료 후 정리
            useBackgroundTaskStore.getState().clearCurrentTask();

            // 전역 토스트 표시 (강제종료된 경우가 아닐 때만)
            // 강제종료 상태 확인
            const forcedStop = localStorage.getItem(
              "mock-settlement-forced-stop"
            );
            if (forcedStop) {
              // 강제종료된 경우 토스트 표시하지 않음
              console.log(
                "모의정산이 강제종료되어 토스트를 표시하지 않습니다."
              );
              // 강제종료 상태 제거
              localStorage.removeItem("mock-settlement-forced-stop");
            } else {
              // 정상 완료인 경우 토스트 표시
              useGlobalToastStore.getState().showToast({
                message: "모의정산 등록이 완료되었습니다.",
                type: "success",
                duration: 5000,
              });
            }
          } else {
            // 진행 중인 경우 상태 업데이트
            useBackgroundTaskStore
              .getState()
              .updateTaskStatus("processing", "모의정산 등록이 진행 중입니다.");
          }
        } else {
          // API 호출 실패 시에도 모니터링 계속 (네트워크 문제일 수 있음)
          console.log("모의정산 상태 확인 API 호출 실패, 모니터링 계속");
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
    console.log("모든 백그라운드 모니터링 중단 시작");
    for (const [taskId, intervalId] of this.monitoringIntervals.entries()) {
      clearInterval(intervalId);
      console.log("모니터링 중단됨:", taskId);
    }
    this.monitoringIntervals.clear();
    console.log("모든 백그라운드 모니터링 중단 완료");
  }

  // 페이지 로드 시 진행 중인 작업 복구
  static initialize() {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    console.log("BackgroundTaskService 초기화 중...");

    try {
      // localStorage에서 진행 중인 작업 확인
      const savedTask = localStorage.getItem("mock-settlement-task");

      if (savedTask) {
        const task = JSON.parse(savedTask);
        console.log("복구할 작업:", task);

        if (
          task &&
          (task.status === "processing" || task.status === "pending")
        ) {
          // 스토어에 작업 복구
          useBackgroundTaskStore.getState().setCurrentTask(task);

          // 진행 중인 작업만 모니터링 재시작
          this.startBackgroundMonitoring(task.id);
        }
      }
    } catch (error) {
      console.error("BackgroundTaskService 초기화 중 오류:", error);
    }
  }

  // 현재 작업 정리 (외부에서 호출용)
  static clearCurrentTask() {
    try {
      // 모든 모니터링 중단
      this.stopAllMonitoring();

      // 스토어 초기화
      useBackgroundTaskStore.getState().clearCurrentTask();

      console.log("현재 작업 정리 완료");
    } catch (error) {
      console.error("현재 작업 정리 중 오류:", error);
    }
  }
}
