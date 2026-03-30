import { StoreService } from './../store.service';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    private storeService: StoreService,
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
    this.storeService.currentViewedMarkdown$.asObservable().subscribe({
      next: (res: string) => {
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(res);
        this.isMiniMapOpen = this.storeService.miniMapView$.getValue();
        this.cdr.detectChanges();
        setTimeout(() => this.updateContentAndGenerateMiniMap(), 100);
      },
    });
  }

  updateContentAndGenerateMiniMap() {
    if (!this.contentRef) return;
    const elements = this.contentRef.nativeElement.querySelectorAll('*');
    const miniMapItems: { el: HTMLElement; title: string; type: string }[] = [];
    elements.forEach((el: HTMLElement) => {
      const text = el.textContent?.trim() || '';
      // /* RTL/LTR styling */
      if (this.containsArabic(text)) {
        el.style.direction = 'rtl';
        el.style.textAlign = 'right';
        if (el.tagName.toLowerCase() === 'blockquote') {
          el.style.borderRight = '.25em solid var(--color-border-default)';
          el.style.borderLeft = 'none';
        }
      } else {
        el.style.direction = 'ltr';
        el.style.textAlign = 'left';
      }
      // /* Special NEW_FILE_START styling */
      if (this.containsNEW_FILE_START(text)) {
        el.style.fontSize = '50px';
        el.style.fontWeight = 'bold';
        miniMapItems.push({ el, title: text, type: 'file' });
      }
      // Collect headers
      if (['H1', 'H2', 'H3'].includes(el.tagName)) {
        miniMapItems.push({ el, title: text, type: el.tagName.toLowerCase() });
      }
    });
    this.miniMapItems = miniMapItems;
    this.cdr.detectChanges();
  }

  toggleMiniMap() {
    this.isMiniMapOpen = !this.isMiniMapOpen;
    this.storeService.toggleMiniMap();
    this.cdr.detectChanges();
  }

  scrollTo(item: any) {
    item.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    item.el.style.outline = '2px solid orange';
    this.cdr.detectChanges();
    setTimeout(() => (item.el.style.outline = ''), 1500);
  }

  scrollToTop() {
    const el = this.contentRef.nativeElement;
    el.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.detectChanges();
  }

  // ------------------------  DIVIDER  helpers ---------------------------------------------------
  containsNEW_FILE_START(text: string) {
    if (!text) return false;
    return text.includes('----- NEW_FILE_START');
  }

  containsArabic(text: string) {
    if (!text) return false;
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
  }

  getCleanTitle(item: any): string {
    return item.title.replace('----- NEW_FILE_START', '').replace('-----', '').replace('- ', '');
  }

  getDisplayTitle(item: any): string {
    let title = this.getCleanTitle(item);
    if (!['h1', 'file'].includes(item.type)) {
      title = '- ' + title;
    }
    return title;
  }

  getFontWeight(item: any): string {
    if (item.type === 'file') return 'bolder';
    if (item.type === 'h1') return 'bold';
    return 'normal';
  }

  getFontSize(item: any): string {
    return item.type === 'file' ? '16px' : '14px';
  }

  getSpanWidth(item: any): string {
    switch (item.type) {
      case 'h1':
        return '25px';
      case 'h2':
        return '20px';
      case 'h3':
        return '15px';
      default:
        return '30px';
    }
  }
}
