import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss'
})
export class ApplicationsComponent {
  searchText = '';

  applications = [
    {
      id: 1,
      studentName: 'Rahul Sharma',
      studentEmail: 'rahul@gmail.com',
      phoneNumber: '+91 9876543210',
      photo: 'assets/student-placeholder.png'
    },
    {
      id: 2,
      studentName: 'Arjun Reddy',
      studentEmail: 'Arjun@gmail.com',
      phoneNumber: '+91 9123456780',
      photo: 'assets/student-placeholder.png'
    },
    {
      id: 3,
      studentName: 'Aman Verma',
      studentEmail: 'aman@gmail.com',
      phoneNumber: '+91 9988776655',
      photo: 'assets/student-placeholder.png'
    }
  ];

  constructor(private router: Router) { }

  get filteredApplications() {
    const search = this.searchText.toLowerCase();

    return this.applications.filter(app =>
      app.studentName.toLowerCase().includes(search) ||
      app.studentEmail.toLowerCase().includes(search) ||
      app.phoneNumber.includes(search)
    );
  }

  openApplication(id: number) {
    this.router.navigate(['/applications', id]);
  }

  addApplication() {
    this.router.navigate(['/applications/new']);
  }
}