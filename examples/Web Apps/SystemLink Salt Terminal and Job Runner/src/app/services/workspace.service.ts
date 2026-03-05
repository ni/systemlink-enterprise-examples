import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DebugService } from './debug.service';

export interface Workspace {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  readonly workspaces$ = new BehaviorSubject<Workspace[]>([]);

  constructor(private debug: DebugService) {}

  async loadWorkspaces(): Promise<void> {
    this.debug.log('→ GET /niuser/v1/workspaces');
    try {
      const resp = await fetch('/niuser/v1/workspaces');
      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '');
        this.debug.log(`✗ loadWorkspaces HTTP ${resp.status} ${errBody}`);
        this.workspaces$.next([]);
        return;
      }
      const data = await resp.json();
      const raw = Array.isArray(data.workspaces) ? data.workspaces : [];
      const list: Workspace[] = raw
        .filter((w: any) => w.enabled !== false)
        .map((w: any) => ({ id: w.id, name: w.name || w.id }))
        .sort((a: Workspace, b: Workspace) => {
          if (a.name === 'Default') return -1;
          if (b.name === 'Default') return 1;
          return a.name.localeCompare(b.name);
        });
      this.debug.log(`← ${list.length} workspace(s)`);
      this.workspaces$.next(list);
    } catch (e: any) {
      this.debug.log(`✗ loadWorkspaces: ${e.message}`);
      this.workspaces$.next([]);
    }
  }
}
