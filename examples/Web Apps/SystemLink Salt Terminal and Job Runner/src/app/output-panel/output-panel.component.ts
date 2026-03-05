import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  NimbleTabsModule,
  NimbleTabModule,
  NimbleTabPanelModule,
  NimbleButtonModule,
} from '@ni/nimble-angular';
import {
  JobsService,
  OutputEntry,
  JobHistoryItem,
} from '../services/jobs.service';
import { DebugService, DebugEntry } from '../services/debug.service';

@Component({
  selector: 'app-output-panel',
  standalone: true,
  imports: [
    CommonModule,
    NimbleTabsModule,
    NimbleTabModule,
    NimbleTabPanelModule,
    NimbleButtonModule,
  ],
  templateUrl: './output-panel.component.html',
  styleUrl: './output-panel.component.scss',
})
export class OutputPanelComponent implements OnInit, OnDestroy {
  @Output() loadToEditor = new EventEmitter<JobHistoryItem>();
  @Output() loadToTerminal = new EventEmitter<string>();

  outputEntries: OutputEntry[] = [];
  debugEntries: DebugEntry[] = [];
  jobHistory: JobHistoryItem[] = [];
  status = { type: 'idle', text: 'Idle' };
  debugHasNew = false;
  historyHasNew = false;
  activeTab = 'output';

  private subs: Subscription[] = [];

  constructor(
    private jobsSvc: JobsService,
    private debugSvc: DebugService,
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.jobsSvc.output$.subscribe(
        (entries) => (this.outputEntries = entries),
      ),
      this.jobsSvc.status$.subscribe((status) => (this.status = status)),
      this.jobsSvc.jobHistory$.subscribe((jobs) => (this.jobHistory = jobs)),
      this.jobsSvc.historyHasNew$.subscribe((v) => (this.historyHasNew = v)),
      this.debugSvc.entries$.subscribe(
        (entries) => (this.debugEntries = entries),
      ),
      this.debugSvc.hasNew$.subscribe((v) => (this.debugHasNew = v)),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  onTabChange(event: any): void {
    this.activeTab = event.target?.activeid || 'output';
    if (this.activeTab === 'debug') this.debugSvc.clearNew();
    if (this.activeTab === 'history') this.jobsSvc.clearHistoryNew();
  }

  clearActive(): void {
    if (this.activeTab === 'debug') {
      this.debugSvc.clear();
    } else if (this.activeTab === 'history') {
      // no-op, can't clear history
    } else {
      this.jobsSvc.clearOutput();
    }
  }

  refreshHistory(): void {
    this.jobsSvc.refreshHistory();
  }

  getFunName(job: JobHistoryItem): string {
    return Array.isArray(job.config?.fun)
      ? job.config!.fun.join(', ')
      : String(job.config?.fun || '');
  }

  getArgStr(job: JobHistoryItem): string {
    if (!Array.isArray(job.config?.arg) || job.config!.arg.length === 0)
      return '';
    const firstArg = job.config!.arg[0];
    if (Array.isArray(firstArg)) {
      return firstArg
        .filter((a) => typeof a !== 'object' || a === null)
        .join(' ');
    }
    if (typeof firstArg === 'string') return firstArg;
    return '';
  }

  getTimestamp(job: JobHistoryItem): string {
    return job.createdTimestamp
      ? new Date(job.createdTimestamp).toLocaleString()
      : '';
  }

  getUser(job: JobHistoryItem): string {
    return job.metadata?.user_login || '';
  }

  isCmdRun(job: JobHistoryItem): boolean {
    return this.getFunName(job) === 'cmd.run';
  }

  onEditJob(job: JobHistoryItem): void {
    this.loadToEditor.emit(job);
  }

  onTerminalJob(job: JobHistoryItem): void {
    const cmd = this.getArgStr(job);
    if (cmd) this.loadToTerminal.emit(cmd);
  }
}
