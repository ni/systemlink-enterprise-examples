import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../environments/environment';

const systemLinkServerUrl = environment.systemLinkServerUrl;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false,
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'AngularDemo - SystemLink';

    apiResponse = '';

    constructor(private readonly http: HttpClient) {}

    handleClick(): void {
        this.http.get(`${systemLinkServerUrl}/niauth/v1/auth`)
            .subscribe({
                next: data => {
                    this.apiResponse = JSON.stringify(data, null, 2);
                },
                error: err => {
                    if (err instanceof Error) {
                        this.apiResponse = err.message;
                    } else {
                        this.apiResponse = String(err);
                    }
                }
            });
    }
}
