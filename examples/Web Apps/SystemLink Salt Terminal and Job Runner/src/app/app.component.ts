import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  NimbleThemeProviderModule,
  NimbleButtonModule,
  NimbleSelectModule,
  NimbleListOptionModule,
  NimbleToolbarModule,
  NimbleSpinnerModule,
  NimbleTabsModule,
  NimbleTabModule,
  NimbleTabPanelModule,
} from '@ni/nimble-angular';

import { SystemPanelComponent } from './system-panel/system-panel.component';
import { TerminalComponent } from './terminal/terminal.component';
import { OutputPanelComponent } from './output-panel/output-panel.component';
import {
  SaveDialogComponent,
  SaveJobEvent,
} from './save-dialog/save-dialog.component';

import { SystemsService, SystemInfo } from './services/systems.service';
import { JobsService, JobHistoryItem } from './services/jobs.service';
import { SavedJobsService, SavedJob } from './services/saved-jobs.service';
import { WorkspaceService, Workspace } from './services/workspace.service';
import { DebugService } from './services/debug.service';
import { PRESETS, getDefaultJobJson } from './data/presets';

import { EditorView, basicSetup } from 'codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { foldGutter } from '@codemirror/language';

// Register nimble icon custom elements
import '@ni/nimble-components/dist/esm/icons/arrow-rotate-right';
import '@ni/nimble-components/dist/esm/icons/floppy-disk';
import '@ni/nimble-components/dist/esm/icons/trash';
import '@ni/nimble-components/dist/esm/icons/pencil';
import '@ni/nimble-components/dist/esm/icons/play';
import '@ni/nimble-components/dist/esm/icons/window-code';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NimbleThemeProviderModule,
    NimbleButtonModule,
    NimbleSelectModule,
    NimbleListOptionModule,
    NimbleToolbarModule,
    NimbleSpinnerModule,
    NimbleTabsModule,
    NimbleTabModule,
    NimbleTabPanelModule,
    SystemPanelComponent,
    TerminalComponent,
    OutputPanelComponent,
    SaveDialogComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('codeEditorHost') codeEditorHost!: ElementRef<HTMLDivElement>;
  @ViewChild('terminalComp') terminalComp!: TerminalComponent;
  @ViewChild('saveDialog') saveDialog!: SaveDialogComponent;
  @ViewChild('resizeHandle') resizeHandle!: ElementRef<HTMLDivElement>;
  @ViewChild('outputPanelEl') outputPanelEl!: ElementRef<HTMLDivElement>;
  @ViewChild('jobSelect') jobSelect!: ElementRef;

  presets = PRESETS;
  terminalMode = true; // default to terminal
  selectedSystem: SystemInfo | null = null;
  savedJobs: SavedJob[] = [];
  workspaces: Workspace[] = [];
  selectedSavedJobId = '';
  selectedJobValue = 'new';
  isRunning = false;
  editorDirty = false;
  loadedJobLabel = '';

  private editor: EditorView | null = null;
  private loadedContent = '';
  private subs: Subscription[] = [];

  constructor(
    public systemsSvc: SystemsService,
    public jobsSvc: JobsService,
    public savedJobsSvc: SavedJobsService,
    public workspaceSvc: WorkspaceService,
    private debug: DebugService,
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.systemsSvc.selectedSystem$.subscribe((sys) => {
        this.selectedSystem = sys;
        if (sys) this.jobsSvc.fetchJobHistory(sys.id);
      }),
      this.savedJobsSvc.savedJobs$.subscribe((jobs) => {
        this.savedJobs = jobs;
      }),
      this.workspaceSvc.workspaces$.subscribe((ws) => {
        this.workspaces = ws;
      }),
      this.jobsSvc.isRunning$.subscribe((r) => (this.isRunning = r)),
    );

    this.debug.log('App initialized');
    this.systemsSvc.loadSystems();
    this.savedJobsSvc.refresh();
    this.workspaceSvc.loadWorkspaces();
  }

  private editorContent = '';
  private editorInitialized = false;

  ngAfterViewInit(): void {
    // Fix nimble-tabs shadow DOM overflow so toolbar doesn't scroll
    this.fixTabPanelOverflow();

    // Setup resize handle
    this.setupResize();

    // If starting in editor mode, initialize CM6 now
    if (!this.terminalMode) {
      this.initEditor();
    }
  }

  private initEditor(): void {
    if (!this.codeEditorHost) return;

    // Clean up any existing editor
    if (this.editor) {
      this.editorContent = this.editor.state.doc.toString();
      this.editor.destroy();
      this.editor = null;
    }

    // Clear container
    this.codeEditorHost.nativeElement.innerHTML = '';

    // Inject CM6 styles as a normal <style> tag since adoptedStyleSheets
    // conflict with Nimble/FAST framework and don't apply.
    this.injectEditorStylesheet();

    this.editor = new EditorView({
      state: EditorState.create({
        doc: this.editorContent,
        extensions: [
          basicSetup,
          json(),
          oneDark,
          // Disable fold gutter (the down-caret markers)
          foldGutter({ openText: '', closedText: '' }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && this.loadedContent) {
              this.editorDirty =
                update.state.doc.toString() !== this.loadedContent;
            }
          }),
        ],
      }),
      parent: this.codeEditorHost.nativeElement,
    });
    this.editorInitialized = true;
    this.debug.log('CodeMirror editor initialized');
  }

  private fixTabPanelOverflow(): void {
    const tabsEl = document.querySelector('nimble-tabs.mode-tabs');
    if (!tabsEl?.shadowRoot) return;
    const style = document.createElement('style');
    style.textContent = `
      [part="tabpanel"] {
        flex: 1 !important;
        min-height: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }
      .tabpanel {
        overflow: hidden !important;
      }
    `;
    tabsEl.shadowRoot.appendChild(style);
  }

  private injectEditorStylesheet(): void {
    if (document.getElementById('cm6-layout-fix')) return;
    const style = document.createElement('style');
    style.id = 'cm6-layout-fix';
    style.textContent = `
      .cm-editor {
        display: flex !important;
        flex-direction: column !important;
        height: 100%;
        font-size: 13px;
        position: relative;
      }
      .cm-scroller {
        display: flex !important;
        align-items: flex-start !important;
        overflow: auto !important;
        font-family: monospace;
        line-height: 1.4;
        height: 100%;
        position: relative;
      }
      .cm-content {
        display: block !important;
        flex-grow: 2 !important;
        flex-shrink: 0 !important;
        white-space: pre !important;
        word-wrap: normal !important;
        padding: 4px 0 !important;
        outline: none;
        min-height: 100%;
        tab-size: 4;
      }
      .cm-line {
        padding: 0 2px 0 6px !important;
      }
      .cm-gutters {
        display: flex !important;
        flex-direction: column !important;
        flex-shrink: 0 !important;
        position: sticky !important;
        left: 0;
        z-index: 200;
      }
      .cm-gutter {
        display: flex !important;
        flex-direction: column !important;
        flex-shrink: 0 !important;
        min-height: 100%;
      }
      .cm-lineNumbers .cm-gutterElement {
        padding: 0 3px 0 5px !important;
        min-width: 20px !important;
        text-align: right;
      }
      .cm-foldGutter {
        display: none !important;
      }
      .cm-activeLineGutter {
        background: none;
      }
      .cm-activeLine {
        background: rgba(255, 255, 255, 0.05);
      }
      .cm-selectionBackground {
        background: rgba(100, 130, 255, 0.25) !important;
      }
      .cm-cursor {
        border-left: 1.2px solid #aeafad;
        display: block;
      }
    `;
    document.head.appendChild(style);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.editor?.destroy();
  }

  get targetName(): string {
    return this.systemsSvc.getDisplayName(this.selectedSystem);
  }

  get runDisabled(): boolean {
    return !this.selectedSystem || this.isRunning;
  }

  get runTooltip(): string {
    if (!this.selectedSystem) return 'Select a target system first';
    return `Run the job on ${this.targetName}`;
  }

  toggleMode(): void {
    // Save editor content before switching
    if (!this.terminalMode && this.editor) {
      this.editorContent = this.editor.state.doc.toString();
    }
    this.terminalMode = !this.terminalMode;
    if (this.terminalMode) {
      this.terminalComp?.focus();
    } else {
      // Create editor after Angular renders the container
      setTimeout(() => {
        this.initEditor();
        // Restore job selector to current selection after DOM recreation
        this.setJobSelectValue(this.selectedJobValue);
      }, 0);
    }
  }

  onModeTabChange(event: Event): void {
    const tabsEl = event.target as any;
    const activeId = tabsEl?.activeid;
    if (!activeId) return;
    const wantTerminal = activeId === 'tab-terminal';
    if (wantTerminal !== this.terminalMode) {
      this.toggleMode();
    }
  }

  get modeButtonText(): string {
    return this.terminalMode ? '📋 Job Editor' : '⌨ Terminal';
  }

  onJobSelect(event: any): void {
    const value = event.target?.value;
    if (!value) return;

    if (this.editorDirty) {
      if (!confirm('You have unsaved changes. Discard and switch jobs?')) {
        // Reset select back to current selection
        this.resetJobSelect();
        return;
      }
    }

    if (value === 'new') {
      this.setEditorContent('');
      this.loadedContent = '';
      this.loadedJobLabel = '';
      this.editorDirty = false;
      this.selectedSavedJobId = '';
      this.selectedJobValue = 'new';
      return;
    }

    if (value.startsWith('preset:')) {
      const key = value.substring(7);
      const preset = PRESETS.find((p) => p.key === key);
      if (!preset) return;
      const obj = { fun: preset.fun, arg: preset.arg, metadata: {} };
      const content = JSON.stringify(obj, null, 2);
      this.setEditorContent(content);
      this.loadedContent = content;
      this.loadedJobLabel = preset.label;
      this.editorDirty = false;
      this.selectedSavedJobId = '';
      this.selectedJobValue = value;
    } else if (value.startsWith('saved:')) {
      const id = value.substring(6);
      this.selectedSavedJobId = id;
      this.selectedJobValue = value;
      this.loadSavedJob(id);
    }
  }

  private async loadSavedJob(id: string): Promise<void> {
    try {
      let content = await this.savedJobsSvc.loadContent(id);
      try {
        content = JSON.stringify(JSON.parse(content), null, 2);
      } catch {}
      this.setEditorContent(content);
      const job = this.savedJobs.find((j) => j.id === id);
      this.loadedContent = content;
      this.loadedJobLabel = job?.name || id;
      this.editorDirty = false;
      this.jobsSvc.appendOutput('info', `Loaded saved job: ${job?.name || id}`);
    } catch (e: any) {
      this.jobsSvc.appendOutput('error', `Failed to load job: ${e.message}`);
    }
  }

  async runJob(): Promise<void> {
    if (!this.selectedSystem || this.isRunning) return;

    let jobBody: any;
    try {
      jobBody = JSON.parse(this.getEditorContent());
    } catch (e: any) {
      this.jobsSvc.appendOutput('error', `JSON parse error: ${e.message}`);
      return;
    }

    await this.jobsSvc.runJob(
      this.selectedSystem.id,
      this.systemsSvc.getDisplayName(this.selectedSystem),
      jobBody,
    );
  }

  // Saved jobs
  openSaveDialog(): void {
    this.saveDialog.open();
  }

  async onSaveJob(event: SaveJobEvent): Promise<void> {
    const content = this.getEditorContent();
    try {
      JSON.parse(content);
    } catch {
      this.jobsSvc.appendOutput(
        'error',
        'Cannot save: invalid JSON in editor.',
      );
      return;
    }
    try {
      await this.savedJobsSvc.save(event.name, content, event.workspace);
      this.jobsSvc.appendOutput('success', `Job saved: ${event.name}`);
    } catch (e: any) {
      this.jobsSvc.appendOutput('error', `Failed to save job: ${e.message}`);
    }
  }

  private resetJobSelect(): void {
    const el = this.jobSelect?.nativeElement;
    if (!el) return;
    el.value = this.selectedJobValue;
  }

  private setJobSelectValue(value: string): void {
    const el = this.jobSelect?.nativeElement;
    if (!el) return;
    // Defer to next tick so the DOM list-options are updated first
    setTimeout(() => {
      el.value = value;
    });
  }

  async onOverwriteSavedJob(): Promise<void> {
    if (!this.selectedSavedJobId || !this.editorDirty) return;
    const content = this.getEditorContent();
    try {
      JSON.parse(content);
    } catch {
      this.jobsSvc.appendOutput(
        'error',
        'Cannot save: invalid JSON in editor.',
      );
      return;
    }
    const job = this.savedJobs.find((j) => j.id === this.selectedSavedJobId);
    const name = job?.name || this.selectedSavedJobId;
    try {
      await this.savedJobsSvc.delete(this.selectedSavedJobId);
      await this.savedJobsSvc.save(name, content);
      await this.savedJobsSvc.refresh();
      const updated = this.savedJobs.find((j) => j.name === name);
      this.selectedSavedJobId = updated?.id || '';
      this.selectedJobValue = this.selectedSavedJobId
        ? 'saved:' + this.selectedSavedJobId
        : 'new';
      this.loadedContent = content;
      this.loadedJobLabel = name;
      this.editorDirty = false;
      this.jobsSvc.appendOutput('success', `Job saved: ${name}`);
      if (this.selectedSavedJobId) {
        this.setJobSelectValue('saved:' + this.selectedSavedJobId);
      }
    } catch (e: any) {
      this.jobsSvc.appendOutput('error', `Failed to save job: ${e.message}`);
    }
  }

  async onDeleteSavedJob(): Promise<void> {
    if (!this.selectedSavedJobId) return;
    const job = this.savedJobs.find((j) => j.id === this.selectedSavedJobId);
    const name = job?.name || this.selectedSavedJobId;
    if (!confirm(`Delete saved job "${name}"?`)) return;
    try {
      await this.savedJobsSvc.delete(this.selectedSavedJobId);
      this.selectedSavedJobId = '';
      this.selectedJobValue = 'new';
      this.setEditorContent('');
      this.loadedContent = '';
      this.loadedJobLabel = '';
      this.editorDirty = false;
      this.setJobSelectValue('new');
      this.jobsSvc.appendOutput('info', `Deleted saved job: ${name}`);
    } catch (e: any) {
      this.jobsSvc.appendOutput('error', `Failed to delete: ${e.message}`);
    }
  }

  // History actions
  onHistoryLoadToEditor(job: JobHistoryItem): void {
    const config = job.config || {};
    const editorObj = {
      fun: config.fun || [],
      arg: config.arg || [[]],
      timeout: 120,
      metadata: {},
    };
    this.setEditorContent(JSON.stringify(editorObj, null, 2));
    if (this.terminalMode) this.toggleMode();
    this.jobsSvc.appendOutput(
      'info',
      `Loaded job from history: ${(config.fun || []).join(', ')}`,
    );
  }

  onHistoryLoadToTerminal(cmd: string): void {
    if (!this.terminalMode) this.toggleMode();
    this.terminalComp?.setCommand(cmd);
  }

  // Refresh history
  onRefreshHistory(): void {
    if (this.selectedSystem) {
      this.jobsSvc.fetchJobHistory(this.selectedSystem.id);
    }
  }

  // Editor helpers
  private getEditorContent(): string {
    return this.editor?.state.doc.toString() || '';
  }

  private setEditorContent(content: string): void {
    if (!this.editor) return;
    const transaction = this.editor.state.update({
      changes: { from: 0, to: this.editor.state.doc.length, insert: content },
    });
    this.editor.dispatch(transaction);
  }

  // Resize
  private setupResize(): void {
    const handle = this.resizeHandle?.nativeElement;
    const output = this.outputPanelEl?.nativeElement;
    if (!handle || !output) return;

    let dragging = false;
    let startY = 0;
    let startH = 0;

    handle.addEventListener('mousedown', (e: MouseEvent) => {
      dragging = true;
      startY = e.clientY;
      startH = output.offsetHeight;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ns-resize';
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!dragging) return;
      const delta = startY - e.clientY;
      const newH = Math.max(
        80,
        Math.min(window.innerHeight * 0.7, startH + delta),
      );
      output.style.height = newH + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    });
  }
}
