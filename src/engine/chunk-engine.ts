import type { Vector3Like } from './calc-misc';
import { Engine, type EngineOptions } from './engine';
import { Sector, type SectorBuffer } from './sector';

/**
 * an execution's worth of buffer changes, collected from the engine's events:
 * upserts to (re)build/update on the main side, removed to drop.
 */
export interface EngineChunk {
  upserts: { address: string; buffer: SectorBuffer }[];
  removed: string[];
}

type Awaitable<T> = T | Promise<T>;

/**
 * chunk-producing engine contract; synchronous in the worker,
 * a promise across a worker boundary - both satisfy it
 */
export interface IChunkEngine {
  initialize(): Awaitable<EngineChunk>;
  execute(spectatorLocalPosition: Vector3Like): Awaitable<EngineChunk>;
}

/**
 * drives an Engine and batches its per-sector events into one chunk per execution
 */
export class ChunkEngine<T extends Sector> implements IChunkEngine {
  private readonly _engine: Engine<T>;
  private readonly _upserts = new Map<string, SectorBuffer>();
  private readonly _removed = new Set<string>();

  constructor(options: EngineOptions<T>) {
    this._engine = new Engine(options);
    this._engine.onSectorBufferChanged = (address, buffer) => {
      this._removed.delete(address);
      this._upserts.set(address, buffer);
    };
    this._engine.onSectorDisposed = address => {
      this._upserts.delete(address);
      this._removed.add(address);
    };
  }

  initialize(): EngineChunk {
    this._engine.initialize();
    return this._flush();
  }

  execute(spectatorLocalPosition: Vector3Like): EngineChunk {
    this._engine.execute(spectatorLocalPosition);
    return this._flush();
  }

  private _flush(): EngineChunk {
    const chunk: EngineChunk = {
      upserts: [...this._upserts].map(([address, buffer]) => ({ address, buffer })),
      removed: [...this._removed],
    };

    this._upserts.clear();
    this._removed.clear();
    return chunk;
  }
}
