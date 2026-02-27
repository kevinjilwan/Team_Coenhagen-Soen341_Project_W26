export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js v22+ exposes a `localStorage` global when Next.js 15.3.x passes
    // --localstorage-file internally. If the path is invalid the object exists
    // but its methods throw, which breaks SSR libraries like next-themes that
    // check `typeof localStorage !== 'undefined'` before calling .getItem().
    // Resetting it to undefined here restores the expected SSR behaviour.
    try {
      Object.defineProperty(globalThis, "localStorage", {
        get: () => undefined,
        configurable: true,
      });
    } catch {
      // Property not configurable in this environment — ignore
    }
  }
}
