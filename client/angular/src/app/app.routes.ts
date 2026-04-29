import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./modules/welcome/welcome.component').then((c) => c.WelcomeComponent),
  },
  {
    path: 'markdown',
    loadComponent: () =>
      import('./modules/markdown/markdown.component').then(
        (c) => c.MarkdownComponent,
      ),
  },
  {
    path: 'newsletters',
    loadComponent: () =>
      import('./modules/newsletters/newsletters.component').then((c) => c.NewslettersComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
