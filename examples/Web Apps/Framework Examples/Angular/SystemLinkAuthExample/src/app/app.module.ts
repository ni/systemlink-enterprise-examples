import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { NimbleButtonModule, NimbleThemeProviderModule } from '@ni/nimble-angular';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        NimbleThemeProviderModule,
        NimbleButtonModule
    ],
    providers: [
        provideHttpClient(withFetch())
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
