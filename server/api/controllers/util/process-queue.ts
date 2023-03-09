import { MultiTypeProcessQueue } from "./multi-type-process-queue";

enum SingleType {
  ONLY = "ONLY",
}

/**
 * Processes elements in the queue in series to avoid simultaneous operations
 * with each element processed automatically as they enter the queue
 */

export class ProcessQueue<ElementType> extends MultiTypeProcessQueue<
  SingleType,
  ElementType
> {
  constructor(processor: (element: ElementType) => Promise<void> | void) {
    super({
      ["ONLY"]: processor,
    });
  }

  push(element: ElementType) {
    super.push(element, SingleType.ONLY);
  }
}
