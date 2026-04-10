import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NewslettersService {
  constructor(private httpClient: HttpClient) {}

  scrapAndgetNewsletters() {
    let url = environment.baseUrl + `/newsletter`;
    return this.httpClient.get(url);
  }
}
