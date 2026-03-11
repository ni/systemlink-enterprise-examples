import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NimbleButtonModule, NimbleDrawerModule, NimbleThemeProviderModule,} from '@ni/nimble-angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NimbleDrawerModule,
    NimbleThemeProviderModule,
    NimbleButtonModule
  ],
  providers: [
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
