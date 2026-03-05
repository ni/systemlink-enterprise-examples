import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DebugEntry {
  timestamp: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DebugService {
  private entries: DebugEntry[] = [];
  readonly entries$ = new BehaviorSubject<DebugEntry[]>([]);
  readonly hasNew$ = new BehaviorSubject<boolean>(false);

  log(msg: string): void {
    const ts = new Date().toISOString().slice(11, 23);
    this.entries.push({ timestamp: ts, message: msg });
    this.entries$.next([...this.entries]);
    this.hasNew$.next(true);
  }

  clearNew(): void {
    this.hasNew$.next(false);
  }

  clear(): void {
    this.entries = [];
    this.entries$.next([]);
    this.hasNew$.next(false);
  }
}
