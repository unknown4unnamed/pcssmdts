// eslint-disable-next-line @typescript-eslint/no-empty-function
export const logger = (enable: boolean) => (enable ? console.log : () => {});
