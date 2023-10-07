export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      USER: string;
      HOST: string;
      DATABASE: string;
      PASSWORD: string | string;
      PORT: number;
      ENV: "test" | "dev" | "prod";
    }
  }
}
