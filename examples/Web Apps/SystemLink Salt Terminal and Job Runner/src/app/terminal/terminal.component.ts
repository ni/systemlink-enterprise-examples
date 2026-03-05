import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SystemsService } from '../services/systems.service';
import { JobsService } from '../services/jobs.service';

export interface TerminalLine {
  type: 'prompt' | 'result' | 'error' | 'info';
  text: string;
}

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.scss',
})
export class TerminalComponent implements OnInit, OnDestroy {
  lines: TerminalLine[] = [];
  promptText = '$';
  commandHistory: string[] = [];
  historyIdx = -1;
  inputValue = '';
  private subs: Subscription[] = [];

  @ViewChild('termOutput') termOutputEl!: ElementRef<HTMLDivElement>;
  @ViewChild('termInput') termInputEl!: ElementRef<HTMLInputElement>;

  constructor(
    private systemsSvc: SystemsService,
    private jobsSvc: JobsService,
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.systemsSvc.selectedSystem$.subscribe((sys) => {
        if (sys) {
          let name = sys.alias || sys.id;
          if (name.length > 20) name = name.slice(0, 20) + '…';
          this.promptText = `${name} $`;
        } else {
          this.promptText = '$';
        }
      }),
    );

    // Welcome message
    this.append('info', 'SystemLink Salt Terminal');
    this.append(
      'info',
      'Type a command to run via cmd.run on the selected target.',
    );
    this.append('info', 'Built-in: clear, help, target');
    this.append('info', '');
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  focus(): void {
    setTimeout(() => this.termInputEl?.nativeElement?.focus(), 50);
  }

  setCommand(cmd: string): void {
    this.inputValue = cmd;
    this.focus();
  }

  append(type: TerminalLine['type'], text: string): void {
    const cleaned = String(text)
      .replace(/\\r\\n/g, '\n')
      .replace(/\\r/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/^"+|"+$/g, '')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '');

    const lineTexts = cleaned.split('\n');
    for (const line of lineTexts) {
      this.lines.push({ type, text: line });
    }
    this.scrollToBottom();
  }

  clear(): void {
    this.lines = [];
  }

  async onKeyDown(event: KeyboardEvent): Promise<void> {
    if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = this.inputValue;
      this.inputValue = '';
      await this.exec(cmd);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.commandHistory.length > 0 && this.historyIdx > 0) {
        this.historyIdx--;
        this.inputValue = this.commandHistory[this.historyIdx];
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.historyIdx < this.commandHistory.length - 1) {
        this.historyIdx++;
        this.inputValue = this.commandHistory[this.historyIdx];
      } else {
        this.historyIdx = this.commandHistory.length;
        this.inputValue = '';
      }
    }
  }

  private async exec(cmd: string): Promise<void> {
    cmd = cmd.trim();
    if (!cmd) return;

    this.commandHistory.push(cmd);
    this.historyIdx = this.commandHistory.length;
    this.append('prompt', `${this.promptText} ${cmd}`);

    // Built-in commands
    if (cmd === 'clear') {
      this.clear();
      return;
    }
    if (cmd === 'help') {
      this.append(
        'info',
        'Commands are sent as cmd.run jobs to the selected target.',
      );
      this.append('info', '');
      this.append('info', 'Built-in commands:');
      this.append('info', '  clear   — clear the terminal screen');
      this.append('info', '  help    — show this help message');
      this.append('info', '  target  — show currently selected system');
      this.append('info', '');
      this.append(
        'info',
        'All other input is sent to cmd.run on the target system.',
      );
      return;
    }
    if (cmd === 'target') {
      const sys = this.systemsSvc.selectedSystem$.value;
      if (!sys) {
        this.append(
          'error',
          'No system selected. Select one from the left panel.',
        );
      } else {
        const name = sys.alias || sys.id;
        this.append('info', `Target: ${name} (${sys.id})`);
      }
      return;
    }

    const sys = this.systemsSvc.selectedSystem$.value;
    if (!sys) {
      this.append(
        'error',
        'No system selected. Select a system from the left panel first.',
      );
      return;
    }

    this.append('info', 'Submitting job…');

    const sysName = sys.alias || sys.id;
    this.jobsSvc.appendOutput('info', `\n─── Terminal: ${cmd} ───`);
    this.jobsSvc.appendOutput('info', `Target: ${sysName}`);

    const result = await this.jobsSvc.runTerminalCommand(sys.id, cmd);
    if (result.success) {
      this.append('result', result.output);
      this.jobsSvc.appendOutput('success', '─── Result ───');
      this.jobsSvc.appendOutput('result', result.output);
    } else {
      this.append('error', result.output || 'Job failed.');
      this.jobsSvc.appendOutput('error', 'Job failed');
      if (result.output) this.jobsSvc.appendOutput('error', result.output);
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.termOutputEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }
}
