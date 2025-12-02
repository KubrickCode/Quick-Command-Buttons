import { ConfigurationTargetType } from "../pkg/config-constants";
import { ButtonConfig, ImportStrategy } from "../pkg/types";

export type ExtensionEventMap = {
  "button:executed": { button: ButtonConfig; success: boolean };
  "buttonSet:created": { setName: string };
  "buttonSet:deleted": { setName: string };
  "buttonSet:renamed": { newName: string; oldName: string };
  "buttonSet:switched": { setName: string | null };
  "config:changed": { scope: ConfigurationTargetType };
  "configTarget:changed": { target: ConfigurationTargetType };
  "import:completed": { strategy: ImportStrategy };
  "terminal:created": { terminalName: string };
};

export type ExtensionEventType = keyof ExtensionEventMap;

type EventHandler<T> = (payload: T) => void;

type HandlerSet = Set<EventHandler<ExtensionEventMap[ExtensionEventType]>>;

export class EventBus {
  private readonly handlers = new Map<ExtensionEventType, HandlerSet>();

  dispose(): void {
    for (const handlerSet of this.handlers.values()) {
      handlerSet.clear();
    }
    this.handlers.clear();
  }

  emit<K extends ExtensionEventType>(event: K, payload: ExtensionEventMap[K]): void {
    const handlerSet = this.handlers.get(event);
    if (!handlerSet) {
      return;
    }

    for (const handler of handlerSet) {
      try {
        (handler as EventHandler<ExtensionEventMap[K]>)(payload);
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${event}":`, error);
      }
    }
  }

  off<K extends ExtensionEventType>(event: K, handler: EventHandler<ExtensionEventMap[K]>): void {
    const handlerSet = this.handlers.get(event);
    if (!handlerSet) {
      return;
    }

    handlerSet.delete(handler as EventHandler<ExtensionEventMap[ExtensionEventType]>);

    if (handlerSet.size === 0) {
      this.handlers.delete(event);
    }
  }

  on<K extends ExtensionEventType>(
    event: K,
    handler: EventHandler<ExtensionEventMap[K]>
  ): () => void {
    let handlerSet = this.handlers.get(event);

    if (!handlerSet) {
      handlerSet = new Set();
      this.handlers.set(event, handlerSet);
    }

    handlerSet.add(handler as EventHandler<ExtensionEventMap[ExtensionEventType]>);

    return () => this.off(event, handler);
  }
}
