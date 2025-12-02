import { createAppStore, getAppStore, resetAppStore } from "./app-store";
import type { ButtonConfig, ButtonSet } from "../../shared/types";

describe("app-store", () => {
  beforeEach(() => {
    resetAppStore();
  });

  describe("createAppStore", () => {
    it("should create store with default initial state", () => {
      const store = createAppStore();
      const state = store.getState();

      expect(state.activeSet).toBeNull();
      expect(state.buttons).toEqual([]);
      expect(state.buttonSets).toEqual([]);
      expect(state.configTarget).toBe("workspace");
    });
  });

  describe("getAppStore", () => {
    it("should return singleton instance", () => {
      const store1 = getAppStore();
      const store2 = getAppStore();

      expect(store1).toBe(store2);
    });

    it("should create new instance after reset", () => {
      const store1 = getAppStore();
      resetAppStore();
      const store2 = getAppStore();

      expect(store1).not.toBe(store2);
    });
  });

  describe("setButtons", () => {
    it("should update buttons state", () => {
      const store = createAppStore();
      const buttons: ButtonConfig[] = [
        { id: "1", name: "Test", command: "echo test" },
      ];

      store.getState().setButtons(buttons);

      expect(store.getState().buttons).toEqual(buttons);
    });

    it("should replace existing buttons", () => {
      const store = createAppStore();
      const initialButtons: ButtonConfig[] = [
        { id: "1", name: "Initial", command: "echo initial" },
      ];
      const newButtons: ButtonConfig[] = [
        { id: "2", name: "New", command: "echo new" },
      ];

      store.getState().setButtons(initialButtons);
      store.getState().setButtons(newButtons);

      expect(store.getState().buttons).toEqual(newButtons);
    });
  });

  describe("setConfigTarget", () => {
    it("should update configTarget to global", () => {
      const store = createAppStore();

      store.getState().setConfigTarget("global");

      expect(store.getState().configTarget).toBe("global");
    });

    it("should update configTarget to local", () => {
      const store = createAppStore();

      store.getState().setConfigTarget("local");

      expect(store.getState().configTarget).toBe("local");
    });
  });

  describe("setButtonSets", () => {
    it("should update buttonSets state", () => {
      const store = createAppStore();
      const sets: ButtonSet[] = [
        { id: "set-1", name: "Dev", buttons: [] },
        { id: "set-2", name: "Prod", buttons: [] },
      ];

      store.getState().setButtonSets(sets);

      expect(store.getState().buttonSets).toEqual(sets);
    });
  });

  describe("setActiveSet", () => {
    it("should update activeSet state", () => {
      const store = createAppStore();

      store.getState().setActiveSet("set-1");

      expect(store.getState().activeSet).toBe("set-1");
    });

    it("should allow setting activeSet to null", () => {
      const store = createAppStore();
      store.getState().setActiveSet("set-1");

      store.getState().setActiveSet(null);

      expect(store.getState().activeSet).toBeNull();
    });
  });

  describe("subscribe", () => {
    it("should call subscriber when state changes", () => {
      const store = createAppStore();
      const subscriber = jest.fn();

      store.subscribe(subscriber);
      store.getState().setButtons([{ id: "1", name: "Test", command: "test" }]);

      expect(subscriber).toHaveBeenCalled();
    });

    it("should support selector-based subscription", () => {
      const store = createAppStore();
      const buttonsSubscriber = jest.fn();

      store.subscribe((state) => state.buttons, buttonsSubscriber);
      store.getState().setButtons([{ id: "1", name: "Test", command: "test" }]);

      expect(buttonsSubscriber).toHaveBeenCalledWith(
        [{ id: "1", name: "Test", command: "test" }],
        []
      );
    });

    it("should not call selector subscriber when unrelated state changes", () => {
      const store = createAppStore();
      const buttonsSubscriber = jest.fn();

      store.subscribe((state) => state.buttons, buttonsSubscriber);
      store.getState().setConfigTarget("global");

      expect(buttonsSubscriber).not.toHaveBeenCalled();
    });

    it("should unsubscribe when returned function is called", () => {
      const store = createAppStore();
      const subscriber = jest.fn();

      const unsubscribe = store.subscribe(subscriber);
      unsubscribe();
      store.getState().setButtons([{ id: "1", name: "Test", command: "test" }]);

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle rapid state updates correctly", () => {
      const store = createAppStore();
      const updateCount = 100;
      const updates = Array(updateCount)
        .fill(null)
        .map((_, i) => [{ id: String(i), name: `Btn${i}`, command: "test" }]);

      updates.forEach((buttons) => store.getState().setButtons(buttons));

      expect(store.getState().buttons).toEqual(updates[updateCount - 1]);
    });

    it("should support multiple subscribers to same selector", () => {
      const store = createAppStore();
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      store.subscribe((state) => state.buttons, subscriber1);
      store.subscribe((state) => state.buttons, subscriber2);
      store.getState().setButtons([{ id: "1", name: "Test", command: "test" }]);

      expect(subscriber1).toHaveBeenCalled();
      expect(subscriber2).toHaveBeenCalled();
    });

    it("should isolate subscriptions between reset cycles", () => {
      const store1 = getAppStore();
      const subscriber = jest.fn();

      store1.subscribe(subscriber);
      resetAppStore();

      const store2 = getAppStore();
      store2.getState().setButtons([{ id: "1", name: "Test", command: "test" }]);

      expect(subscriber).not.toHaveBeenCalled();
    });

    it("should handle empty arrays", () => {
      const store = createAppStore();
      store.getState().setButtons([{ id: "1", name: "Test", command: "test" }]);

      store.getState().setButtons([]);
      store.getState().setButtonSets([]);

      expect(store.getState().buttons).toEqual([]);
      expect(store.getState().buttonSets).toEqual([]);
    });
  });
});
