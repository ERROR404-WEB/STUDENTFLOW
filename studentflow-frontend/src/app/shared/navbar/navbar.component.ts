import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  userName = localStorage.getItem('name') || 'User';
  role = localStorage.getItem('role') || '';

  showBackButton = true;
  showProfileMenu = false;

  constructor(
    private location: Location,
    private router: Router
  ) { }

  goBack() {
    this.location.back();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout() {

    localStorage.clear();

    this.router.navigate(['/login']);
  }

  getInitials(): string {

    return this.userName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}