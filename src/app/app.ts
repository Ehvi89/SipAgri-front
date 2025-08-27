import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatProgressSpinnerModule, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  loading = false;
  showFullLayouts = false;

  constructor(
    private router: Router,
  ) {}

  ngOnInit() {
    this.showFullLayouts = this.showFullLayout();
  }

  showFullLayout(): boolean {
    const excludedPaths = ['/auth/', '/error'];
    if (['/auth/validate-user'].includes(this.router.url)) {
      return true;
    }
    return !excludedPaths.some(path => this.router.url.includes(path));
  }
}
