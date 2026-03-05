import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NimbleDialogModule,
  NimbleTextFieldModule,
  NimbleButtonModule,
  NimbleSelectModule,
  NimbleListOptionModule,
} from '@ni/nimble-angular';
import { Workspace } from '../services/workspace.service';

export interface SaveJobEvent {
  name: string;
  workspace: string;
}

@Component({
  selector: 'app-save-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NimbleDialogModule,
    NimbleTextFieldModule,
    NimbleButtonModule,
    NimbleSelectModule,
    NimbleListOptionModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './save-dialog.component.html',
  styleUrl: './save-dialog.component.scss',
})
export class SaveDialogComponent {
  @Input() workspaces: Workspace[] = [];
  @Output() saved = new EventEmitter<SaveJobEvent>();
  @ViewChild('dialog') dialogEl!: ElementRef;

  jobName = '';
  selectedWorkspace = '';
  isOpen = false;

  open(): void {
    this.jobName = '';
    // Default to the "Default" workspace if available
    const defaultWs = this.workspaces.find((w) => w.name === 'Default');
    this.selectedWorkspace = defaultWs?.id || (this.workspaces[0]?.id ?? '');
    this.isOpen = true;
    setTimeout(() => {
      const dialogElement = this.dialogEl?.nativeElement;
      if (dialogElement?.show) {
        dialogElement.show();
      }
    }, 0);
  }

  close(): void {
    this.isOpen = false;
    const dialogElement = this.dialogEl?.nativeElement;
    if (dialogElement?.close) {
      dialogElement.close();
    }
  }

  confirm(): void {
    const name = this.jobName.trim();
    if (!name) return;
    this.saved.emit({ name, workspace: this.selectedWorkspace });
    this.close();
  }

  onWorkspaceChange(event: Event): void {
    const el = event.target as any;
    this.selectedWorkspace = el.value || 'Default';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.confirm();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  }
}
