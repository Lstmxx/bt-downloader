export interface LoopOptions {
  /**
   * 间隔时间
   */
  interval?: number;
}

export const loop = (fn: () => boolean | Promise<boolean>, {
  interval = 1000,
}: LoopOptions) => {
  let timer: number | null = null;

  const stop = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const loopFn = async () => {
    const isContinueLoop = await fn();
    if (!isContinueLoop) {
      stop();
      return;
    }
    if (timer !== null) clearTimeout(timer);
    timer = window.setTimeout(loopFn, interval);
  };

  const start = () => {
    stop();
    loopFn();
  };

  return {
    start,
    stop,
  };
};
