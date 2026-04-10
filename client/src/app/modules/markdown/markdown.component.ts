import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MarkdownViewComponent } from './markdown-view/markdown-view.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MarkdownService } from './markdown.service';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  imports: [SidebarComponent, MarkdownViewComponent, NavbarComponent],
})
export class MarkdownComponent {
  isOpen = true;

  constructor(
    private markdownService: MarkdownService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.markdownService.sidebarToggled$.subscribe({
      next: (res: boolean) => {
        this.isOpen = res;
        this.cdr.detectChanges();
      },
    });
  }
}
