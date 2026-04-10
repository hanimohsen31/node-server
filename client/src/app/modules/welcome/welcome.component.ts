import { Component, OnInit } from '@angular/core';
import { routes as Routes } from '../../app.routes';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  standalone: true,
  imports: [RouterModule],
})
export class WelcomeComponent implements OnInit {
  links: any = [];
  exceptions = ['', '**', 'layout'];

  ngOnInit(): void {
    this.makeNavbarRoutes();
  }

  makeNavbarRoutes() {
    Routes.map((elm: any) => {
      if (!this.exceptions.includes(elm.path)) {
        this.links.push(elm?.path);
      }
    });
  }
}
