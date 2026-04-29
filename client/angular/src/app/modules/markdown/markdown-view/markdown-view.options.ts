export function updateContentAndGenerateMiniMap(contentRef: any): any {
  if (!contentRef) return;
  const elements = contentRef.nativeElement.querySelectorAll('*');
  const miniMapItems: { el: HTMLElement; title: string; type: string }[] = [];
  elements.forEach((el: HTMLElement) => {
    const text = el.textContent?.trim() || '';
    // /* RTL/LTR styling */
    if (containsArabic(text)) {
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
    if (containsNEW_FILE_START(text)) {
      el.style.fontSize = '50px';
      el.style.fontWeight = 'bold';
      miniMapItems.push({ el, title: text, type: 'file' });
    }
    // Collect headers
    if (['H1', 'H2', 'H3'].includes(el.tagName)) {
      miniMapItems.push({ el, title: text, type: el.tagName.toLowerCase() });
    }
  });
  return miniMapItems;
}

export function scrollTo(item: any) {
  item.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  item.el.style.outline = '2px solid orange';
  setTimeout(() => (item.el.style.outline = ''), 1500);
}

export function scrollToTop(contentRef: any) {
  const el = contentRef.nativeElement;
  el.scrollTo({ top: 0, behavior: 'smooth' });
}

// ------------------------  DIVIDER  helpers ---------------------------------------------------
export function containsNEW_FILE_START(text: string) {
  if (!text) return false;
  return text.includes('----- NEW_FILE_START');
}

export function containsArabic(text: string) {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

export function getCleanTitle(item: any): string {
  return item.title.replace('----- NEW_FILE_START', '').replace('-----', '').replace('- ', '');
}

export function getDisplayTitle(item: any): string {
  let title = getCleanTitle(item);
  if (!['h1', 'file'].includes(item.type)) {
    title = '- ' + title;
  }
  return title;
}

export function getFontWeight(item: any): string {
  if (item.type === 'file') return 'bolder';
  if (item.type === 'h1') return 'bold';
  return 'normal';
}

export function getFontSize(item: any): string {
  return item.type === 'file' ? '16px' : '14px';
}

export function getSpanWidth(item: any): string {
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
