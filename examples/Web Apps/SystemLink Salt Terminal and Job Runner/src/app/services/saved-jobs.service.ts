import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DebugService } from './debug.service';

export interface SavedJob {
  id: string;
  name: string;
}

const FILE_SVC = '/nifile/v1/service-groups/Default';
const SAVED_JOB_EXT = 'saltjob';

@Injectable({ providedIn: 'root' })
export class SavedJobsService {
  readonly savedJobs$ = new BehaviorSubject<SavedJob[]>([]);

  constructor(private debug: DebugService) {}

  async refresh(): Promise<void> {
    this.debug.log(
      `→ POST ${FILE_SVC}/query-files-linq (extension=${SAVED_JOB_EXT})`,
    );
    try {
      const resp = await fetch(`${FILE_SVC}/query-files-linq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: `extension = "${SAVED_JOB_EXT}"`,
          orderBy: 'updated',
          orderByDescending: true,
          take: 1000,
        }),
      });
      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '');
        this.debug.log(`✗ fetchSavedJobs HTTP ${resp.status} ${errBody}`);
        this.savedJobs$.next([]);
        return;
      }
      const data = await resp.json();
      this.debug.log(`← response keys: ${Object.keys(data).join(', ')}`);
      const list = Array.isArray(data.availableFiles)
        ? data.availableFiles
        : Array.isArray(data.files)
          ? data.files
          : [];
      this.debug.log(`← ${list.length} saved job(s)`);
      const jobs = list.map((f: any) => {
        const raw = f.properties?.Name || f.id;
        const displayName = raw.replace(/\.saltjob$/i, '');
        return { id: f.id, name: displayName };
      });
      this.savedJobs$.next(jobs);
    } catch (e: any) {
      this.debug.log(`✗ refreshSavedJobs: ${e.message}`);
      this.savedJobs$.next([]);
    }
  }

  async save(
    name: string,
    json: string,
    workspaceId?: string,
  ): Promise<SavedJob> {
    this.debug.log(
      `→ uploading saved job file: ${name} to workspace ${workspaceId || 'default'}`,
    );
    const blob = new Blob([json], { type: 'application/json' });
    const fd = new FormData();
    fd.append('file', blob, `${name}.saltjob`);
    fd.append('metadata', JSON.stringify({ Name: `${name}.saltjob` }));

    const url = workspaceId
      ? `${FILE_SVC}/upload-files?workspace=${encodeURIComponent(workspaceId)}`
      : `${FILE_SVC}/upload-files`;
    const resp = await fetch(url, {
      method: 'POST',
      body: fd,
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`Upload failed: HTTP ${resp.status} ${errText}`);
    }
    const result = await resp.json();
    const uri = result.uri || '';
    const id = uri.split('/').pop()!;
    this.debug.log(`✓ job saved: ${name} (${id})`);
    const saved = { id, name };

    const current = this.savedJobs$.value;
    this.savedJobs$.next([...current, saved]);
    return saved;
  }

  async loadContent(id: string): Promise<string> {
    this.debug.log(`→ GET ${FILE_SVC}/files/${id}/data`);
    const resp = await fetch(`${FILE_SVC}/files/${id}/data?inline=true`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    this.debug.log(`← loaded content (${text.length} chars)`);
    return text;
  }

  async delete(id: string): Promise<void> {
    this.debug.log(`→ DELETE ${FILE_SVC}/files/${id}`);
    const resp = await fetch(`${FILE_SVC}/files/${id}`, {
      method: 'DELETE',
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    this.debug.log(`✓ deleted saved job ${id}`);
    const current = this.savedJobs$.value.filter((j) => j.id !== id);
    this.savedJobs$.next(current);
  }
}
