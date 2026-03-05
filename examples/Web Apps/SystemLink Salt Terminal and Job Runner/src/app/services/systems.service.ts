import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DebugService } from './debug.service';

export interface SystemInfo {
  id: string;
  alias?: string;
  grains?: { data?: { host?: string; kernel?: string } };
  connected?: { data?: { state?: string } };
}

@Injectable({ providedIn: 'root' })
export class SystemsService {
  readonly systems$ = new BehaviorSubject<SystemInfo[]>([]);
  readonly selectedSystem$ = new BehaviorSubject<SystemInfo | null>(null);
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly error$ = new BehaviorSubject<string | null>(null);

  constructor(private debug: DebugService) {}

  async loadSystems(): Promise<void> {
    this.loading$.next(true);
    this.error$.next(null);
    this.debug.log('loadSystems() called');

    try {
      this.debug.log('→ POST /nisysmgmt/v1/query-systems (timeout 15 s)');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        this.debug.log('✗ fetch timed out after 15 s — aborting');
        controller.abort();
      }, 15000);

      let resp: Response;
      try {
        resp = await fetch('/nisysmgmt/v1/query-systems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filter: 'connected.data.state = "CONNECTED"',
            take: 500,
            orderBy: 'alias',
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      this.debug.log(`← HTTP ${resp.status} ${resp.statusText}`);
      if (!resp.ok) {
        const body = await resp.text().catch(() => '');
        this.debug.log(`   response body: ${body.slice(0, 300)}`);
        throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      }

      const data = await resp.json();
      this.debug.log(`   response keys: ${Object.keys(data).join(', ')}`);
      const systems: SystemInfo[] = Array.isArray(data.data) ? data.data : [];
      this.debug.log(`← received ${systems.length} system(s)`);
      this.systems$.next(systems);
      this.debug.log('loadSystems() complete');
    } catch (err: any) {
      this.debug.log(`✗ loadSystems error: ${err.name}: ${err.message}`);
      this.error$.next(`Failed to load: ${err.message}`);
    } finally {
      this.loading$.next(false);
    }
  }

  selectSystem(id: string): void {
    const sys = this.systems$.value.find((s) => s.id === id) || null;
    this.selectedSystem$.next(sys);
    this.debug.log(`Selected system: ${sys?.alias || id}`);
  }

  getDisplayName(sys: SystemInfo | null): string {
    if (!sys) return '— none selected —';
    return sys.alias || sys.id;
  }

  getState(sys: SystemInfo): string {
    return sys.connected?.data?.state || 'UNKNOWN';
  }

  getHost(sys: SystemInfo): string {
    return sys.grains?.data?.host || '';
  }

  getKernel(sys: SystemInfo): string {
    return sys.grains?.data?.kernel || '';
  }
}
