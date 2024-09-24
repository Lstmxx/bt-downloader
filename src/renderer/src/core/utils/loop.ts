export interface LoopOptions {
  /**
   * 间隔时间
   */
  interval?: number;
}

export const loop = (fn: () => boolean | Promise<boolean>, { interval = 1000 }: LoopOptions) => {
  let timer: number | null = null;
  let isCancelled = false;

  const stop = () => {
    isCancelled = true;
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const loopFn = async () => {
    if (isCancelled) return;
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
    isCancelled = false;
    loopFn();
  };

  return {
    start,
    stop,
  };
};
