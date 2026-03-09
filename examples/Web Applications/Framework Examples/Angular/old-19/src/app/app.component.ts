import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import {
  NimbleDrawerModule,
  NimbleThemeProviderModule,
  NimbleMenuButtonModule
} from '@ni/nimble-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NimbleDrawerModule,
    NimbleThemeProviderModule,
    NimbleMenuButtonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular19-app';
}