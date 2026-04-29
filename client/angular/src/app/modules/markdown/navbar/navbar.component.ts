import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarkdownService } from '../markdown.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterModule],
})
export class NavbarComponent implements OnInit {
  isSidebarOpen: boolean = true;
  breadCrumbs: string[] = [];

  constructor(private storeService: MarkdownService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.storeService.sidebarToggled$.subscribe({
      next: (res: boolean) => {
        this.isSidebarOpen = res;
        this.cdr.detectChanges();
      },
    });
    this.storeService.currentSelectedFile$.subscribe({
      next: (res: any) => {
        this.breadCrumbs = res?.path?.split('D:\\Projects\\Markdown')?.[1].slice(1)?.split('\\');
        this.cdr.detectChanges();
      },
    });
  }

  toggleSidebar() {
    this.storeService.toggleSidebar();
  }
}
