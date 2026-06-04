import { memedService } from './memedService';

const MEMED_SCRIPT_URL =
  import.meta.env.VITE_MEMED_SCRIPT_URL ||
  'https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js';

export const MEMED_MODULE_NAME = 'plataforma.prescricao';
const INIT_TIMEOUT_MS = 30_000;
const READY_POLL_MS = 200;

let moduleReady = false;
let currentToken: string | null = null;
let initPromise: Promise<void> | null = null;

function isMdHubAvailable(): boolean {
  return typeof window.MdHub !== 'undefined';
}

function isModuleInitialized(module: { name?: string; moduleName?: string }): boolean {
  const name = module.name ?? module.moduleName;
  return name === MEMED_MODULE_NAME;
}

function markModuleReady(token: string): void {
  moduleReady = true;
  currentToken = token;
}

function removeScriptTag(): void {
  document.querySelector('script[data-memed="true"]')?.remove();
}

function removeMemedDomArtifacts(): void {
  document
    .querySelectorAll('[id*="mdhub"], [class*="mdhub"], iframe[src*="memed"]')
    .forEach((el) => el.remove());
}

function clearGlobals(): void {
  delete (window as Partial<Window>).MdHub;
  delete (window as Partial<Window>).MdSinapsePrescricao;
}

function waitForModuleInit(token: string): Promise<void> {
  if (moduleReady && currentToken === token) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let sinapsePoll: ReturnType<typeof setInterval> | null = null;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (sinapsePoll) clearInterval(sinapsePoll);
      markModuleReady(token);
      resolve();
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (sinapsePoll) clearInterval(sinapsePoll);
      reject(new Error(message));
    };

    const timeout = setTimeout(() => {
      fail('Memed: timeout ao aguardar inicialização do módulo');
    }, INIT_TIMEOUT_MS);

    const onModuleInit = (module: { name?: string; moduleName?: string }) => {
      if (isModuleInitialized(module)) {
        finish();
      }
    };

    const registerListener = () => {
      if (typeof window.MdSinapsePrescricao === 'undefined') return false;
      window.MdSinapsePrescricao.event.add('core:moduleInit', onModuleInit);
      return true;
    };

    if (registerListener()) return;

    sinapsePoll = setInterval(() => {
      if (registerListener()) {
        clearInterval(sinapsePoll!);
        sinapsePoll = null;
      }
    }, READY_POLL_MS);
  });
}

function loadScript(token: string): Promise<void> {
  if (moduleReady && currentToken === token && isMdHubAvailable()) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>('script[data-memed="true"]');
  if (existing) {
    const existingToken = existing.getAttribute('data-token');
    if (existingToken === token) {
      if (moduleReady && isMdHubAvailable()) {
        return Promise.resolve();
      }
      return waitForModuleInit(token);
    }
    teardownInternal();
  } else if (isMdHubAvailable() || typeof window.MdSinapsePrescricao !== 'undefined') {
    if (moduleReady && currentToken === token && isMdHubAvailable()) {
      return Promise.resolve();
    }
    teardownInternal();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MEMED_SCRIPT_URL;
    script.setAttribute('data-token', token);
    script.setAttribute('data-memed', 'true');
    script.setAttribute('data-color', '#1A4B84');

    script.onerror = () => {
      teardownInternal();
      reject(new Error('Memed: falha ao carregar o script'));
    };

    script.addEventListener('load', () => {
      waitForModuleInit(token).then(resolve).catch(reject);
    });

    document.body.appendChild(script);
  });
}

function teardownInternal(): void {
  try {
    if (typeof window.MdHub !== 'undefined') {
      window.MdHub.command.send(MEMED_MODULE_NAME, 'logout');
    }
  } catch {
    // best-effort
  }

  try {
    if (typeof window.MdHub !== 'undefined') {
      window.MdHub.module.hide(MEMED_MODULE_NAME);
    }
  } catch {
    // best-effort
  }

  removeScriptTag();
  removeMemedDomArtifacts();
  clearGlobals();

  moduleReady = false;
  currentToken = null;
  initPromise = null;
}

function isReady(): boolean {
  return moduleReady && isMdHubAvailable();
}

async function init(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const token = await memedService.getPrescriberToken();

    if (moduleReady && currentToken === token && isMdHubAvailable()) {
      return;
    }

    if (currentToken !== null && currentToken !== token) {
      teardownInternal();
    }

    await loadScript(token);
  })();

  try {
    await initPromise;
  } catch (err) {
    initPromise = null;
    throw err;
  }
}

function logout(): void {
  teardownInternal();
}

export const memedManager = {
  init,
  logout,
  isReady,
  get moduleName() {
    return MEMED_MODULE_NAME;
  },
};
