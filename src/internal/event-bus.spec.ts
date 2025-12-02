import { EventBus } from "./event-bus";

describe("EventBus", () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    eventBus.dispose();
    jest.restoreAllMocks();
  });

  describe("on/emit", () => {
    it("should call handler when event is emitted", () => {
      const handler = jest.fn();
      eventBus.on("config:changed", handler);

      eventBus.emit("config:changed", { scope: "local" });

      expect(handler).toHaveBeenCalledWith({ scope: "local" });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should call multiple handlers in subscription order", () => {
      const callOrder: number[] = [];
      const handler1 = jest.fn(() => callOrder.push(1));
      const handler2 = jest.fn(() => callOrder.push(2));
      const handler3 = jest.fn(() => callOrder.push(3));

      eventBus.on("config:changed", handler1);
      eventBus.on("config:changed", handler2);
      eventBus.on("config:changed", handler3);

      eventBus.emit("config:changed", { scope: "workspace" });

      expect(callOrder).toEqual([1, 2, 3]);
    });

    it("should not call handlers for different events", () => {
      const configHandler = jest.fn();
      const buttonSetHandler = jest.fn();

      eventBus.on("config:changed", configHandler);
      eventBus.on("buttonSet:switched", buttonSetHandler);

      eventBus.emit("config:changed", { scope: "global" });

      expect(configHandler).toHaveBeenCalledTimes(1);
      expect(buttonSetHandler).not.toHaveBeenCalled();
    });

    it("should do nothing when emitting event with no handlers", () => {
      expect(() => {
        eventBus.emit("config:changed", { scope: "local" });
      }).not.toThrow();
    });

    it("should return unsubscribe function from on()", () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.on("config:changed", handler);

      eventBus.emit("config:changed", { scope: "local" });
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      eventBus.emit("config:changed", { scope: "local" });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("off", () => {
    it("should unsubscribe specific handler", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on("config:changed", handler1);
      eventBus.on("config:changed", handler2);

      eventBus.off("config:changed", handler1);

      eventBus.emit("config:changed", { scope: "local" });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("should do nothing when unsubscribing non-existent handler", () => {
      const handler = jest.fn();

      expect(() => {
        eventBus.off("config:changed", handler);
      }).not.toThrow();
    });

    it("should do nothing when unsubscribing from event with no handlers", () => {
      const handler = jest.fn();

      expect(() => {
        eventBus.off("buttonSet:switched", handler);
      }).not.toThrow();
    });
  });

  describe("dispose", () => {
    it("should remove all handlers", () => {
      const configHandler = jest.fn();
      const buttonSetHandler = jest.fn();
      const terminalHandler = jest.fn();

      eventBus.on("config:changed", configHandler);
      eventBus.on("buttonSet:switched", buttonSetHandler);
      eventBus.on("terminal:created", terminalHandler);

      eventBus.dispose();

      eventBus.emit("config:changed", { scope: "local" });
      eventBus.emit("buttonSet:switched", { setName: "test" });
      eventBus.emit("terminal:created", { terminalName: "test" });

      expect(configHandler).not.toHaveBeenCalled();
      expect(buttonSetHandler).not.toHaveBeenCalled();
      expect(terminalHandler).not.toHaveBeenCalled();
    });

    it("should be safe to call dispose multiple times", () => {
      const handler = jest.fn();
      eventBus.on("config:changed", handler);

      expect(() => {
        eventBus.dispose();
        eventBus.dispose();
      }).not.toThrow();
    });
  });

  describe("error isolation", () => {
    it("should continue executing other handlers when one throws", () => {
      const errorHandler = jest.fn(() => {
        throw new Error("Test error");
      });
      const normalHandler = jest.fn();

      eventBus.on("config:changed", errorHandler);
      eventBus.on("config:changed", normalHandler);

      eventBus.emit("config:changed", { scope: "local" });

      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(normalHandler).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        '[EventBus] Error in handler for "config:changed":',
        expect.any(Error)
      );
    });

    it("should execute all handlers even if multiple throw errors", () => {
      const results: string[] = [];
      const handler1 = jest.fn(() => {
        results.push("handler1");
        throw new Error("Error 1");
      });
      const handler2 = jest.fn(() => {
        results.push("handler2");
        throw new Error("Error 2");
      });
      const handler3 = jest.fn(() => {
        results.push("handler3");
      });

      eventBus.on("config:changed", handler1);
      eventBus.on("config:changed", handler2);
      eventBus.on("config:changed", handler3);

      eventBus.emit("config:changed", { scope: "local" });

      expect(results).toEqual(["handler1", "handler2", "handler3"]);
      expect(console.error).toHaveBeenCalledTimes(2);
    });
  });

  describe("type safety", () => {
    it("should accept correct payload types for each event", () => {
      const buttonExecutedHandler = jest.fn();
      const buttonSetCreatedHandler = jest.fn();
      const buttonSetDeletedHandler = jest.fn();
      const buttonSetRenamedHandler = jest.fn();
      const buttonSetSwitchedHandler = jest.fn();
      const configChangedHandler = jest.fn();
      const configTargetChangedHandler = jest.fn();
      const importCompletedHandler = jest.fn();
      const terminalCreatedHandler = jest.fn();

      eventBus.on("button:executed", buttonExecutedHandler);
      eventBus.on("buttonSet:created", buttonSetCreatedHandler);
      eventBus.on("buttonSet:deleted", buttonSetDeletedHandler);
      eventBus.on("buttonSet:renamed", buttonSetRenamedHandler);
      eventBus.on("buttonSet:switched", buttonSetSwitchedHandler);
      eventBus.on("config:changed", configChangedHandler);
      eventBus.on("configTarget:changed", configTargetChangedHandler);
      eventBus.on("import:completed", importCompletedHandler);
      eventBus.on("terminal:created", terminalCreatedHandler);

      eventBus.emit("button:executed", {
        button: { command: "test", id: "1", name: "Test" },
        success: true,
      });
      eventBus.emit("buttonSet:created", { setName: "new-set" });
      eventBus.emit("buttonSet:deleted", { setName: "old-set" });
      eventBus.emit("buttonSet:renamed", { newName: "renamed", oldName: "original" });
      eventBus.emit("buttonSet:switched", { setName: "my-set" });
      eventBus.emit("buttonSet:switched", { setName: null });
      eventBus.emit("config:changed", { scope: "local" });
      eventBus.emit("configTarget:changed", { target: "workspace" });
      eventBus.emit("import:completed", { strategy: "merge" });
      eventBus.emit("terminal:created", { terminalName: "Terminal 1" });

      expect(buttonExecutedHandler).toHaveBeenCalledWith({
        button: { command: "test", id: "1", name: "Test" },
        success: true,
      });
      expect(buttonSetCreatedHandler).toHaveBeenCalledWith({ setName: "new-set" });
      expect(buttonSetDeletedHandler).toHaveBeenCalledWith({ setName: "old-set" });
      expect(buttonSetRenamedHandler).toHaveBeenCalledWith({
        newName: "renamed",
        oldName: "original",
      });
      expect(buttonSetSwitchedHandler).toHaveBeenCalledTimes(2);
      expect(configChangedHandler).toHaveBeenCalledWith({ scope: "local" });
      expect(configTargetChangedHandler).toHaveBeenCalledWith({ target: "workspace" });
      expect(importCompletedHandler).toHaveBeenCalledWith({ strategy: "merge" });
      expect(terminalCreatedHandler).toHaveBeenCalledWith({ terminalName: "Terminal 1" });
    });
  });

  describe("handler prevents duplicate subscription", () => {
    it("should not add same handler twice for same event", () => {
      const handler = jest.fn();

      eventBus.on("config:changed", handler);
      eventBus.on("config:changed", handler);

      eventBus.emit("config:changed", { scope: "local" });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
