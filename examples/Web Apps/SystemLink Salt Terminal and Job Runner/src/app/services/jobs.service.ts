import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DebugService } from './debug.service';

export interface JobHistoryItem {
  jid?: string;
  state?: string;
  config?: {
    fun?: string[];
    arg?: any[][];
  };
  result?: any;
  error?: any;
  createdTimestamp?: string;
  metadata?: { user_login?: string };
}

export type OutputEntry = {
  type: 'info' | 'success' | 'error' | 'warn' | 'result';
  text: string;
};

@Injectable({ providedIn: 'root' })
export class JobsService {
  readonly isRunning$ = new BehaviorSubject<boolean>(false);
  readonly status$ = new BehaviorSubject<{ type: string; text: string }>({
    type: 'idle',
    text: 'Idle',
  });
  readonly output$ = new BehaviorSubject<OutputEntry[]>([]);
  readonly jobHistory$ = new BehaviorSubject<JobHistoryItem[]>([]);
  readonly historyHasNew$ = new BehaviorSubject<boolean>(false);

  private outputEntries: OutputEntry[] = [];
  private lastSystemId = '';

  constructor(private debug: DebugService) {}

  appendOutput(type: OutputEntry['type'], text: string): void {
    this.outputEntries.push({ type, text });
    this.output$.next([...this.outputEntries]);
  }

  clearOutput(): void {
    this.outputEntries = [];
    this.output$.next([]);
    this.status$.next({ type: 'idle', text: 'Idle' });
  }

  setStatus(type: string, text: string): void {
    this.status$.next({ type, text });
  }

  formatResult(val: any): string {
    if (Array.isArray(val) && val.length === 1) val = val[0];

    let text: string;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        text = JSON.stringify(parsed, null, 2);
      } catch {
        text = val;
      }
    } else if (typeof val === 'object' && val !== null) {
      text = JSON.stringify(val, null, 2);
    } else {
      text = String(val);
    }

    // Decode unicode escapes
    text = text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
    // Clean escape sequences
    text = text
      .replace(/\\r\\n/g, '\n')
      .replace(/\\r/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
    // Strip surrounding quotes
    text = text.replace(/^"([\s\S]*)"$/, '$1');
    return text;
  }

  async runJob(
    selectedId: string,
    sysName: string,
    jobBody: any,
  ): Promise<void> {
    if (this.isRunning$.value) return;

    if (!Array.isArray(jobBody.fun) || jobBody.fun.length === 0) {
      this.appendOutput(
        'error',
        'Job must have a "fun" array with at least one function name.',
      );
      return;
    }
    if (!Array.isArray(jobBody.arg)) {
      this.appendOutput('error', 'Job must have an "arg" array.');
      return;
    }

    const payload = {
      fun: jobBody.fun,
      arg: jobBody.arg,
      tgt: [selectedId],
      timeout: jobBody.timeout || 120,
      metadata: jobBody.metadata || {},
    };

    this.isRunning$.next(true);
    this.setStatus('running', '⏳ Running…');
    this.appendOutput('info', '\n─── Job submitted ───');
    this.appendOutput('info', `Target : ${sysName} (${selectedId})`);
    this.appendOutput('info', `Fun    : ${payload.fun.join(', ')}`);

    try {
      const createResp = await fetch('/nisysmgmt/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!createResp.ok) {
        const errText = await createResp.text();
        throw new Error(`HTTP ${createResp.status}: ${errText}`);
      }
      const created = await createResp.json();
      const jid = created.jid;
      if (!jid) throw new Error('No jid returned from job creation.');

      this.appendOutput('info', `Job ID : ${jid}`);
      this.appendOutput('info', 'Polling for results…');
      await this.pollJobResult(jid);
    } catch (err: any) {
      this.appendOutput('error', `Error: ${err.message}`);
      this.setStatus('error', '✗ Error');
    } finally {
      this.isRunning$.next(false);
      // Auto-refresh history after job completes
      if (selectedId) {
        this.fetchJobHistory(selectedId);
      }
    }
  }

  private async pollJobResult(jid: string): Promise<void> {
    const TERMINAL_STATES = ['SUCCEEDED', 'FAILED', 'CANCELED'];
    const MAX_ATTEMPTS = 60;
    let attempt = 0;
    let sawOutOfQueue = false;

    while (attempt < MAX_ATTEMPTS) {
      await this.sleep(2000);
      attempt++;

      const pollResp = await fetch(
        `/nisysmgmt/v1/jobs?jid=${encodeURIComponent(jid)}`,
      );
      if (!pollResp.ok) throw new Error(`Poll failed: HTTP ${pollResp.status}`);

      const jobs = await pollResp.json();
      const job = Array.isArray(jobs) ? jobs[0] : null;
      if (!job) {
        this.appendOutput(
          'warn',
          `Attempt ${attempt}: no job data yet, retrying…`,
        );
        continue;
      }

      const state = job.state || 'UNKNOWN';

      if (state === 'OUTOFQUEUE') {
        if (!sawOutOfQueue) {
          sawOutOfQueue = true;
          this.appendOutput(
            'warn',
            `Attempt ${attempt}: OUTOFQUEUE — job may still be running, continuing to poll…`,
          );
        }
        const oqRet = job.result?.return;
        const oqSuccess = job.result?.success?.[0];
        if (oqRet !== undefined && oqRet !== null && oqSuccess) {
          this.appendOutput(
            'info',
            'Final state: OUTOFQUEUE (result available)',
          );
          this.appendOutput('success', '─── Result ───');
          this.appendOutput('result', this.formatResult(oqRet));
          this.setStatus('success', '✓ Succeeded (late)');
          return;
        }
        continue;
      }

      if (!TERMINAL_STATES.includes(state)) {
        this.appendOutput('info', `Attempt ${attempt}: state = ${state}`);
        continue;
      }

      this.appendOutput('info', `Final state: ${state}`);

      if (state === 'SUCCEEDED') {
        const ret = job.result?.return;
        if (ret !== undefined && ret !== null) {
          this.appendOutput('success', '─── Result ───');
          this.appendOutput('result', this.formatResult(ret));
        } else {
          this.appendOutput('success', 'Job succeeded (no return value).');
        }
        this.setStatus('success', '✓ Succeeded');
      } else {
        const errData = job.result || job.error || {};
        this.appendOutput('error', `Job ${state}`);
        if (errData) this.appendOutput('error', this.formatResult(errData));
        this.setStatus('error', `✗ ${state}`);
      }
      return;
    }

    this.appendOutput('warn', 'Timed out waiting for job result (>2 min).');
    this.setStatus('error', '⚠ Timeout');
  }

  async fetchJobHistory(systemId: string): Promise<void> {
    this.lastSystemId = systemId;
    this.debug.log(`→ POST /nisysmgmt/v1/query-jobs for ${systemId}`);
    try {
      const resp = await fetch('/nisysmgmt/v1/query-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: `(id == "${systemId}")`,
          orderBy: 'lastUpdatedTimestamp descending',
          take: 50,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const jobs: JobHistoryItem[] = Array.isArray(data.data) ? data.data : [];
      this.debug.log(`← ${jobs.length} job(s) in history`);
      this.jobHistory$.next(jobs);
      if (jobs.length > 0) this.historyHasNew$.next(true);
    } catch (e: any) {
      this.debug.log(`✗ fetchJobHistory: ${e.message}`);
      this.jobHistory$.next([]);
    }
  }

  clearHistoryNew(): void {
    this.historyHasNew$.next(false);
  }

  async refreshHistory(): Promise<void> {
    if (this.lastSystemId) {
      await this.fetchJobHistory(this.lastSystemId);
    }
  }

  async runTerminalCommand(
    selectedId: string,
    cmd: string,
  ): Promise<{ success: boolean; output: string }> {
    const payload = {
      fun: ['cmd.run'],
      arg: [[cmd]],
      tgt: [selectedId],
      timeout: 120,
      metadata: {},
    };

    try {
      const createResp = await fetch('/nisysmgmt/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!createResp.ok) {
        const errText = await createResp.text();
        throw new Error(`HTTP ${createResp.status}: ${errText}`);
      }
      const created = await createResp.json();
      const jid = created.jid;
      if (!jid) throw new Error('No jid returned.');

      this.appendOutput('info', `Job ID: ${jid}`);
      const result = await this.terminalPollResult(jid);
      this.refreshHistory();
      return result;
    } catch (err: any) {
      return { success: false, output: `Error: ${err.message}` };
    }
  }

  private async terminalPollResult(
    jid: string,
  ): Promise<{ success: boolean; output: string }> {
    const MAX = 60;
    for (let i = 0; i < MAX; i++) {
      await this.sleep(2000);
      const resp = await fetch(
        `/nisysmgmt/v1/jobs?jid=${encodeURIComponent(jid)}`,
      );
      if (!resp.ok) throw new Error(`Poll failed: HTTP ${resp.status}`);
      const jobs = await resp.json();
      const job = Array.isArray(jobs) ? jobs[0] : null;
      if (!job) continue;

      const state = job.state || 'UNKNOWN';

      if (state === 'OUTOFQUEUE') {
        const oqRet = job.result?.return;
        const oqOk = job.result?.success?.[0];
        if (oqRet !== undefined && oqRet !== null && oqOk) {
          return { success: true, output: this.formatResult(oqRet) };
        }
        continue;
      }

      if (state === 'SUCCEEDED') {
        const ret = job.result?.return;
        return {
          success: true,
          output: ret != null ? this.formatResult(ret) : '(no output)',
        };
      }
      if (state === 'FAILED' || state === 'CANCELED') {
        const errData = job.result || job.error || {};
        return { success: false, output: this.formatResult(errData) };
      }
    }
    return { success: false, output: 'Timed out waiting for result.' };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
