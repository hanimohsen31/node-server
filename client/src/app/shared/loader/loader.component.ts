import { CommonModule } from '@angular/common';
import { LoaderService } from './../services/loader.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [CommonModule],
})
export class LoaderComponent implements OnInit {
  isVisible: any;

  constructor(private loaderService: LoaderService) {}
  ngOnInit() {
    this.isVisible = this.loaderService.isLoading$;
  }
}
