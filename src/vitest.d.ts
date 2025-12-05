import type { vi as viType, Mock, MockInstance, Mocked, MockedFunction, MockedObject, SpyInstance } from "vitest";

declare global {
  const suite: typeof import("vitest")["suite"];
  const test: typeof import("vitest")["test"];
  const describe: typeof import("vitest")["describe"];
  const it: typeof import("vitest")["it"];
  const expectTypeOf: typeof import("vitest")["expectTypeOf"];
  const assertType: typeof import("vitest")["assertType"];
  const expect: typeof import("vitest")["expect"];
  const assert: typeof import("vitest")["assert"];
  const vitest: typeof import("vitest")["vitest"];
  const vi: typeof viType;
  const beforeAll: typeof import("vitest")["beforeAll"];
  const afterAll: typeof import("vitest")["afterAll"];
  const beforeEach: typeof import("vitest")["beforeEach"];
  const afterEach: typeof import("vitest")["afterEach"];
  const onTestFailed: typeof import("vitest")["onTestFailed"];
  const onTestFinished: typeof import("vitest")["onTestFinished"];

  // Vitest namespace for type assertions like `as vi.Mock`
  namespace vi {
    export type Mock<T = any, Y extends any[] = any[]> = import("vitest").Mock<T, Y>;
    export type MockInstance<T = any, Y extends any[] = any[]> = import("vitest").MockInstance<T, Y>;
    export type Mocked<T> = import("vitest").Mocked<T>;
    export type MockedFunction<T extends (...args: any[]) => any> = import("vitest").MockedFunction<T>;
    export type MockedObject<T> = import("vitest").MockedObject<T>;
    export type SpyInstance<T extends (...args: any[]) => any = (...args: any[]) => any> = import("vitest").MockInstance<T>;
  }
}

export {};
