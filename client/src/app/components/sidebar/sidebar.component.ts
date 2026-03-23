import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StoreService } from '../store.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path?: string;
  relativePath?: string;
  children?: FileNode[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class SidebarComponent implements OnInit {
  isOpen = true;
  currentActiveFile: FileNode | null = null;
  tree: FileNode | null = null;
  private storageKey = 'sidebar-expanded';

  constructor(
    private storeService: StoreService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getMarkdownList();
    this.cdr.detectChanges();

    this.storeService.sidebarToggled$.subscribe({
      next: (res: boolean) => {
        this.isOpen = res;
        this.cdr.detectChanges();
      },
    });

    this.storeService.currentSelectedFile$
      .subscribe({
        next: (res: any) => {
          this.onFileClick(res);
        },
      })
      .unsubscribe();
  }

  getMarkdownList() {
    this.storeService.getMarkDownFilesList().subscribe({
      next: (res: any) => {
        this.tree = res.tree;
        this.restoreExpandedState();
        this.cdr.detectChanges();
      },
    });
  }

  onFileClick(node: FileNode) {
    this.storeService.getMarkDownFile(node).subscribe({
      next: (res: any) => {
        this.currentActiveFile = node;
        this.storeService.updateCurrentViewedMarkdown(res);
        this.storeService.updateCurrentSelectedFile(node);
        this.cdr.detectChanges();
      },
    });
  }

  // ------------------------  DIVIDER  toggling sidebar elements ---------------------------------
  toggle(node: FileNode) {
    if (node.type === 'directory') node.expanded = !node.expanded;
    this.saveExpandedState();
  }

  saveExpandedState() {
    console.log('object1');
    const expandedPaths: string[] = [];
    const traverse = (node: FileNode) => {
      if (node.type === 'directory' && node.expanded && node.path) expandedPaths.push(node.path);
      node.children?.forEach(traverse);
    };
    this.tree?.children?.forEach(traverse);
    localStorage.setItem(this.storageKey, JSON.stringify(expandedPaths));
  }

  restoreExpandedState() {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) return;
    const expandedPaths: string[] = JSON.parse(saved).map((p: any) => p.replace(/\\/g, '/'));
    const expandedSet = new Set(expandedPaths);
    const traverse = (node: FileNode) => {
      if (node.type === 'directory' && node.path) {
        const normalizedPath = node.path.replace(/\\/g, '/');
        node.expanded = expandedSet.has(normalizedPath);
      }
      node.children?.forEach(traverse);
    };
    this.tree?.children?.forEach(traverse);
  }

  // ------------------------  DIVIDER  helpers ---------------------------------------------------
  isDirectory(node: FileNode): boolean {
    return node.type === 'directory';
  }
}
