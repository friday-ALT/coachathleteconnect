type Handler = () => void;

let unauthorizedHandler: Handler | null = null;

export function setUnauthorizedHandler(handler: Handler | null) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  unauthorizedHandler?.();
}
