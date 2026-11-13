const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export default function createLoader() {
  let index = 0;
  let message = 'Initializing system...';

  const draw = () => {
    const frame = spinnerFrames[index++ % spinnerFrames.length];

    process.stdout.write(
      `\r\x1B[2K\x1B[38;5;111m${frame}  ${message}\x1B[0m`
    );
  };

  draw();

  const timer = setInterval(draw, 80);

  return {
    async update(status: string) {
      message = status;
      draw();

      // فرصت نمایش مرحله جدید
      await sleep(350);
    },

    stop(status: string, success = true) {
      clearInterval(timer);

      const symbol = success ? '✓' : '✕';

      process.stdout.write(
        `\r\x1B[2K\x1B[38;5;111m${symbol}  ${status}\x1B[0m\n`
      );
    }
  };
}