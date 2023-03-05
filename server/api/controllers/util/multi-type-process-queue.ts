/**
 * Processes elements in the queue in series to avoid simultaneous operations,
 * with each element processed automatically as they enter the queue
 */

export class MultiTypeProcessQueue<
  SwitchTypes extends string | number | symbol,
  EntryType
> {
  queue: {
    type: SwitchTypes;
    entry: EntryType;
  }[] = [];
  elementProcessors: {
    [key in SwitchTypes]: (element: EntryType) => Promise<void> | void;
  };
  constructor(elementProcessors: {
    [key in SwitchTypes]: (element: EntryType) => Promise<void> | void;
  }) {
    this.elementProcessors = elementProcessors;
  }

  push(entry: EntryType, type: SwitchTypes): void {
    this.queue.push({ type, entry });

    if (this.queue.length === 1) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    const processor = this.elementProcessors[this.queue[0].type];
    await processor(this.queue[0].entry);

    this.queue.splice(0, 1);

    if (this.queue.length > 0) this.process();
  }
}
