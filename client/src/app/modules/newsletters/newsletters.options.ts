export const SOURCE_ICONS: Record<string, string> = {
  TheRunDown: '📰',
  TechCrunch: '🚀',
  Openai: '🤖',
  Superhuman: '⚡',
  Deepmind: '🧠',
  Ycombinator: '🟠',
  Artificialintelligence: '🔬',
  Aiweekly: '📬',
  Github: '🐙',
  X: '✖️',
  Youtube: '▶️',
  Facebook: '👥',
  GoogleNews: 'G',
};
export function getIcon(source: string): string {
  return SOURCE_ICONS[source] || '📄';
}

export function getImage(item: any): string | null {
  return item.image?.src || item.thumbnail?.src || item.avatar || null;
}

export function getTitle(item: any): string {
  return item.title || item.text?.slice(0, 120) || item.name || '(no title)';
}

export function getUrl(item: any): string {
  return item.url || item.tweetUrl || item.commentsUrl || '#';
}

export function getDate(item: any): string {
  return (
    item.date || item.publishedAt || item.publishedLabel || item.dateText || item.publishedAgo || ''
  );
}

export function getMeta(item: any): string {
  return item.category || item.language || item.handle || '';
}

export function getDescription(item: any): string {
  return (
    item.description || item.subtitle || (item.content ? item.content.slice(0, 200) : '') || ''
  );
}
export function getStats(item: any): { key: string; value: string }[] {
  if (item.stats) {
    return Object.entries(item.stats)
      .filter(([, v]) => v)
      .map(([k, v]) => ({ key: k, value: String(v) }));
  }
  if (item.reactions) {
    return Object.entries(item.reactions).map(([k, v]) => ({ key: k, value: String(v) }));
  }
  return [];
}
