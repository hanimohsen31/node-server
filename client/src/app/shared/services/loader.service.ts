import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoading$ = new BehaviorSubject(false);
  constructor() {}

  startLoading() {
    setTimeout(() => this.isLoading$.next(true));
  }

  endLoading() {
    setTimeout(() => this.isLoading$.next(false));
  }
}
