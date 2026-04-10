import { MarkdownService } from '../markdown.service';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LoaderService } from '../../../shared/services/loader.service';
import {
  containsArabic,
  containsNEW_FILE_START,
  getCleanTitle,
  getDisplayTitle,
  getFontSize,
  getFontWeight,
  getSpanWidth,
  updateContentAndGenerateMiniMap,
  scrollTo,
  scrollToTop,
} from './markdown-view.options';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-markdown-view',
  templateUrl: './markdown-view.component.html',
  styleUrls: ['./markdown-view.component.scss'],
})
export class MarkdownViewComponent implements OnInit {
  @ViewChild('contentContainer') contentRef!: ElementRef;
  safeHtml!: SafeHtml;
  isSidebarOpen: boolean = true;
  isVisible = false;
  isMiniMapOpen = false;
  miniMapItems: { el: HTMLElement; title: string; type: string }[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private storeService: MarkdownService,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadMarkdown();
    this.storeService.sidebarToggled$.subscribe({
      next: (res: boolean) => (this.isSidebarOpen = res),
    });
  }

  ngAfterViewInit() {
    const el = this.contentRef.nativeElement;
    el.addEventListener('scroll', () => {
      const y = el.scrollTop;
      this.isVisible = y > 300;
      this.cdr.detectChanges();
    });
  }

  loadMarkdown() {
    this.loaderService.startLoading();
    this.storeService.currentViewedMarkdown$
      .asObservable()
      .pipe(finalize(() => this.loaderService.endLoading()))
      .subscribe({
        next: (res: string) => {
          this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(res);
          this.isMiniMapOpen = this.storeService.miniMapView$.getValue();
          this.cdr.detectChanges();
          setTimeout(() => this.updateContentAndGenerateMiniMap(), 100);
        },
      });
  }

  toggleMiniMap() {
    this.isMiniMapOpen = !this.isMiniMapOpen;
    this.storeService.toggleMiniMap();
    this.cdr.detectChanges();
  }

  // ------------------------  DIVIDER  helpers ---------------------------------------------------
  updateContentAndGenerateMiniMap() {
    this.miniMapItems = updateContentAndGenerateMiniMap(this.contentRef);
    this.cdr.detectChanges();
  }

  scrollTo(item: any) {
    scrollTo(item);
    this.cdr.detectChanges();
  }

  scrollToTop() {
    scrollToTop(this.contentRef);
    this.cdr.detectChanges();
  }

  containsNEW_FILE_START(text: string) {
    return containsNEW_FILE_START(text);
  }

  containsArabic(text: string) {
    return containsArabic(text);
  }

  getCleanTitle(item: any): string {
    return getCleanTitle(item);
  }

  getDisplayTitle(item: any): string {
    return getDisplayTitle(item);
  }

  getFontWeight(item: any): string {
    return getFontWeight(item);
  }

  getFontSize(item: any): string {
    return getFontSize(item);
  }

  getSpanWidth(item: any): string {
    return getSpanWidth(item);
  }
}
