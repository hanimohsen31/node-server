import { ActivatedRoute, RouterModule } from '@angular/router';
import { StoreService } from './../store.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterModule],
})
export class NavbarComponent implements OnInit {
  isSidebarOpen: boolean = true;
  constructor(private storeService: StoreService) {}

  ngOnInit() {
   this.storeService.sidebarToggled$.subscribe({
     next: (res: boolean) => {
       this.isSidebarOpen = res;
     },
   })
  }

  toggleSidebar() {
    this.storeService.toggleSidebar();
  }
}
