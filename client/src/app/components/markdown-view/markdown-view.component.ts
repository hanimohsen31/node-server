import { StoreService } from './../store.service';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
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
  isVisible = true;

  constructor(
    private sanitizer: DomSanitizer,
    private storeService: StoreService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadMarkdown();
    window.addEventListener('scroll', () => console.log('window scroll'));
    this.storeService.sidebarToggled$.subscribe({
      next: (res: boolean) => {
        this.isSidebarOpen = res;
      },
    });
  }

  loadMarkdown() {
    this.storeService.currentViewedMarkdown$.asObservable().subscribe({
      next: (res: string) => {
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(res);
        setTimeout(() => this.updateContentAndGenerateMiniMap(), 100);
        this.updateContentAndGenerateMiniMap();
        this.cdr.detectChanges();
      },
    });
  }

  private containsNEW_FILE_START(text: string) {
    if (!text) return false;
    return text.includes('----- NEW_FILE_START');
  }

  private containsArabic(text: string) {
    if (!text) return false;
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
  }

  updateContentAndGenerateMiniMap() {
    if (!this.contentRef) return;
    const elements = this.contentRef.nativeElement.querySelectorAll('*');
    const miniMapItems: { el: HTMLElement; title: string; type: string }[] = [];
    elements.forEach((el: HTMLElement) => {
      const text = el.textContent?.trim() || '';
      // RTL/LTR styling
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
      // Special NEW_FILE_START styling
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

    // Create mini-map container
    this.createMiniMap(miniMapItems);
  }

  createMiniMap(items: { el: HTMLElement; title: string; type: string }[]) {
    // Remove old mini-map if exists
    let miniMap = document.getElementById('mini-map');
    if (miniMap) miniMap.remove();
    miniMap = document.createElement('div');
    miniMap.id = 'mini-map';

    let itemsContainer = document.querySelector('.items-container');
    if (itemsContainer) itemsContainer.remove();
    itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container';
    miniMap.appendChild(itemsContainer);

    let spansContainer = document.querySelector('.spans-container');
    if (spansContainer) spansContainer.remove();
    spansContainer = document.createElement('div');
    spansContainer.className = 'spans-container';
    miniMap.appendChild(spansContainer);

    items.forEach((item) => {
      const entry = document.createElement('div');
      let title = item.title.includes('----- NEW_FILE_START')
        ? item.title.replace('----- NEW_FILE_START', '').replace('-----', '')
        : item.title;
      !['h1', 'file'].includes(item.type) && (title = '- ' + title);
      entry.textContent = title;
      entry.style.cursor = 'pointer';
      entry.style.fontWeight =
        item.type === 'file' ? 'bolder' : item.type === 'h1' ? 'bold' : 'normal';
      entry.style.fontSize = item.type === 'file' ? '16px' : '14px';
      entry.title = title.replace('- ', ''); // hover tooltip

      entry.addEventListener('click', () => {
        item.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        item.el.style.outline = '2px solid orange';
        setTimeout(() => (item.el.style.outline = ''), 1500);
      });

      itemsContainer.appendChild(entry);
    });

    items.forEach((item) => {
      const entry = document.createElement('div');
      entry.style.width =
        item.type === 'h1'
          ? '25px'
          : item.type === 'h2'
            ? '20px'
            : item.type === 'h3'
              ? '15px'
              : '30px';
      spansContainer.appendChild(entry);
    });

    document.body.appendChild(miniMap);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const y = window.scrollY;
    const visible = y > 300;
    if (visible !== this.isVisible) {
      this.isVisible = visible;
      this.cdr.detectChanges();
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.detectChanges();
  }
}
