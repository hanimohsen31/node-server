import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from "./shared/loader/loader.component";

@Component({
  selector: 'app-root',
  imports: [RouterModule, LoaderComponent],
  templateUrl: './app.component.html',
})
export class App {}
