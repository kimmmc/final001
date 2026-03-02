// Global type declarations for deployment
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    PORT?: string;
    MONGODB_URI?: string;
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    CORS_ORIGIN?: string;
    SWAGGER_PORT?: string;
    ENABLE_SEEDING?: string;
  }

  interface Process {
    env: ProcessEnv;
    exit(code?: number): never;
  }
}

declare const process: NodeJS.Process;
declare const console: Console;
declare const require: NodeRequire;

interface Console {
  log(...data: any[]): void;
  error(...data: any[]): void;
  warn(...data: any[]): void;
  info(...data: any[]): void;
} 