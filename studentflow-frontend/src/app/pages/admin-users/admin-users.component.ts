import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AdminUsersService } from './admin-users.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {

  searchText = '';
  showUserDialog = false;

  roles = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Agent', value: 'AGENT' },
    { label: 'QA Officer', value: 'QA_OFFICER' },
    { label: 'Admission Officer', value: 'ADMISSION_OFFICER' },
    { label: 'Visa Officer', value: 'VISA_OFFICER' },
    { label: 'Enrolment Officer', value: 'ENROLMENT_OFFICER' }
  ];

  users: any[] = [];

  newUser = {
    name: '',
    email: '',
    password: '',
    role: ''
  };

  constructor(private adminUsersService: AdminUsersService) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.adminUsersService.getUsers().subscribe({
      next: (res: any) => {
        if (res && res.users) {
          this.users = res.users;
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  get filteredUsers() {
    if (!this.searchText.trim()) {
      return this.users;
    }

    return this.users.filter(user =>
      (user.name?.toLowerCase().includes(this.searchText.toLowerCase()) || '') ||
      (user.email?.toLowerCase().includes(this.searchText.toLowerCase()) || '') ||
      (user.role?.toLowerCase().includes(this.searchText.toLowerCase()) || '')
    );
  }

  openCreateUser() {
    this.showUserDialog = true;
  }

  createUser() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password || !this.newUser.role) {
      alert('All fields are required');
      return;
    }

    this.adminUsersService.createUser(this.newUser).subscribe({
      next: (res: any) => {
        this.showUserDialog = false;
        this.getData(); // Reload
        this.newUser = {
          name: '',
          email: '',
          password: '',
          role: ''
        };
      },
      error: (err) => {
        console.error('Error creating user:', err);
        alert('Failed to create user: ' + (err.error?.message || err.message));
      }
    });
  }

  toggleUser(user: any) {
    const updatedStatus = !user.isActive;
    this.adminUsersService.toggleUserStatus(user._id, updatedStatus).subscribe({
      next: (res: any) => {
        user.isActive = updatedStatus;
      },
      error: (err) => {
        console.error('Error toggling user status:', err);
        alert('Failed to update status: ' + (err.error?.message || err.message));
      }
    });
  }
}