import { LoaderService } from '../../shared/services/loader.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NewslettersService } from './newsletters.service';
import { finalize } from 'rxjs/internal/operators/finalize';
import {
  getDate,
  getDescription,
  getIcon,
  getImage,
  getMeta,
  getStats,
  getTitle,
  getUrl,
} from './newsletters.options';

@Component({
  selector: 'app-newsletters',
  templateUrl: './newsletters.component.html',
  styleUrls: ['./newsletters.component.scss'],
})
export class NewslettersComponent implements OnInit {
  newsletters: any[] = [];
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private newslettersService: NewslettersService,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.scrapAndgetNewsletters();
  }

  scrapAndgetNewsletters() {
    this.loaderService.startLoading();
    return this.newslettersService
      .scrapAndgetNewsletters()
      .pipe(
        finalize(() => {
          this.loaderService.endLoading();
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res: any) => (this.newsletters = res?.data ?? []),
        error: () => (this.newsletters = []),
      });
  }

  // -------------------  DIVIDER  Helpers --------------------------------------------------------
  getIcon(source: string): string {
    return getIcon(source);
  }

  getImage(item: any): string | null {
    return getImage(item);
  }

  getTitle(item: any): string {
    return getTitle(item);
  }

  getUrl(item: any): string {
    return getUrl(item);
  }

  getDate(item: any): string {
    return getDate(item);
  }

  getMeta(item: any): string {
    return getMeta(item);
  }

  getDescription(item: any): string {
    return getDescription(item);
  }

  getStats(item: any): { key: string; value: string }[] {
    return getStats(item);
  }
}
