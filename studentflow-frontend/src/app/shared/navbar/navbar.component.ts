import { Component, inject } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private location = inject(Location);
  private router = inject(Router);

  showBackButton = false;

  constructor() {
    // Determine whether to show back button based on route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.showBackButton = currentUrl !== '/' && currentUrl !== '/login';
    });
  }

  goBack() {
    this.location.back();
  }
}

