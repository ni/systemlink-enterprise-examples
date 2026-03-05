import {
  Component,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NimbleTextFieldModule, NimbleButtonModule } from '@ni/nimble-angular';
import { SystemsService, SystemInfo } from '../services/systems.service';

// Register nimble icon custom element
import '@ni/nimble-components/dist/esm/icons/arrow-rotate-right';

@Component({
  selector: 'app-system-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NimbleTextFieldModule,
    NimbleButtonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './system-panel.component.html',
  styleUrl: './system-panel.component.scss',
})
export class SystemPanelComponent implements OnInit, OnDestroy {
  systems: SystemInfo[] = [];
  filteredSystems: SystemInfo[] = [];
  selectedId: string | null = null;
  searchQuery = '';
  private subs: Subscription[] = [];

  constructor(public systemsSvc: SystemsService) {}

  ngOnInit(): void {
    this.subs.push(
      this.systemsSvc.systems$.subscribe((systems) => {
        this.systems = systems;
        this.applyFilter();
      }),
      this.systemsSvc.selectedSystem$.subscribe((sys) => {
        this.selectedId = sys?.id || null;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  onSearch(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    const q = this.searchQuery.toLowerCase();
    if (!q) {
      this.filteredSystems = this.systems;
    } else {
      this.filteredSystems = this.systems.filter((s) => {
        const alias = (s.alias || s.id || '').toLowerCase();
        const host = (s.grains?.data?.host || '').toLowerCase();
        return alias.includes(q) || host.includes(q);
      });
    }
  }

  refresh(): void {
    this.systemsSvc.loadSystems();
  }

  selectSystem(id: string): void {
    this.systemsSvc.selectSystem(id);
  }

  getState(sys: SystemInfo): string {
    return this.systemsSvc.getState(sys);
  }

  getHost(sys: SystemInfo): string {
    return this.systemsSvc.getHost(sys);
  }

  getKernel(sys: SystemInfo): string {
    return this.systemsSvc.getKernel(sys);
  }

  getDisplayName(sys: SystemInfo): string {
    return sys.alias || sys.id;
  }

  getStateBadgeClass(sys: SystemInfo): string {
    const state = this.getState(sys);
    if (['CONNECTED', 'DISCONNECTED', 'VIRTUAL'].includes(state)) {
      return `badge-${state}`;
    }
    return 'badge-default';
  }
}
