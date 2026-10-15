// I file dell'app (colture.js, promemoria.js) scrivono su `window`: nel server lo facciamo puntare a globalThis.
// deno-lint-ignore no-explicit-any
(globalThis as any).window = globalThis;
