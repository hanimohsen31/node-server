import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  currentViewedMarkdown$ = new BehaviorSubject('');
  currentSelectedFile$ = new BehaviorSubject<any>(null);
  sidebarToggled$ = new BehaviorSubject<boolean>(false);
  miniMapView$ = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient) {
    let savedValue = localStorage.getItem('markdownSidebar');
    if (savedValue == 'true') {
      this.sidebarToggled$.next(true);
      localStorage.setItem('markdownSidebar', `true`);
    } else if (savedValue == 'false') {
      this.sidebarToggled$.next(false);
      localStorage.setItem('markdownSidebar', `false`);
    } else {
      this.sidebarToggled$.next(true);
      localStorage.setItem('markdownSidebar', `true`);
    }

    let savedFile = localStorage.getItem('markdownCurrentSelectedFile');
    if (savedFile) {
      this.currentSelectedFile$.next(JSON.parse(savedFile));
    }

    let savedMiniMap = localStorage.getItem('markdownMiniMap');
    if (savedMiniMap) {
      this.miniMapView$.next(JSON.parse(savedMiniMap));
    }
  }

  updateCurrentViewedMarkdown(markdown: string) {
    this.currentViewedMarkdown$.next(markdown);
  }

  updateCurrentSelectedFile(fileNode: any) {
    this.currentSelectedFile$.next(fileNode);
    localStorage.setItem('markdownCurrentSelectedFile', JSON.stringify(fileNode));
  }

  toggleSidebar() {
    let currentValue = this.sidebarToggled$.getValue();
    this.sidebarToggled$.next(!currentValue);
    localStorage.setItem('markdownSidebar', `${!currentValue}`);
  }

  toggleMiniMap() {
    let currentValue = this.miniMapView$.getValue();
    this.miniMapView$.next(!currentValue);
    localStorage.setItem('markdownMiniMap', `${!currentValue}`);
  }

  // responnse json
  getMarkDownFilesList() {
    let url = environment.baseUrl + `/markdown/v3`;
    return this.httpClient.get(url);
  }

  // response html
  getMarkDownFile(fileNode: any) {
    const url = environment.baseUrl + `/markdown/v3/view`;
    return this.httpClient.post(url, fileNode, { responseType: 'text' });
  }

  // responnse json
  setMarkdownPath(path: string) {
    let url = environment.baseUrl + `/markdown/v3/set-path`;
    return this.httpClient.put(url, { path });
  }
}
