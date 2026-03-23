import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MarkdownViewComponent } from './components/markdown-view/markdown-view.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { StoreService } from './components/store.service';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, MarkdownViewComponent, NavbarComponent],
  templateUrl: './app.component.html',
})
export class App {
  isOpen = true;

  constructor(
    private storeService: StoreService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.storeService.sidebarToggled$.subscribe({
      next: (res: boolean) => {
        this.isOpen = res;
        this.cdr.detectChanges();
      },
    });
  }
}
