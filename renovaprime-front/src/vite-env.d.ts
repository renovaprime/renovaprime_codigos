/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MEMED_SCRIPT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface MdHubStatic {
  command: {
    send(module: string, command: string, data?: unknown): void;
  };
  event: {
    add(event: string, callback: (data: unknown) => void): void;
    remove(event: string, callback?: (data: unknown) => void): void;
  };
  module: {
    show(module: string): void;
    hide(module: string): void;
  };
}

interface MdSinapsePrescricaoStatic {
  event: {
    add(event: string, callback: (module: { name?: string; moduleName?: string }) => void): void;
    remove(event: string): void;
  };
}

declare global {
  interface Window {
    MdHub: MdHubStatic;
    MdSinapsePrescricao: MdSinapsePrescricaoStatic;
  }
}
