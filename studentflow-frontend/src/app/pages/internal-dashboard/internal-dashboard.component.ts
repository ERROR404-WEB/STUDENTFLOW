import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ApplicationFormService } from '../application-form/application-form.service';

@Component({
  selector: 'app-internal-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './internal-dashboard.component.html',
  styleUrl: './internal-dashboard.component.scss'
})
export class InternalDashboardComponent implements OnInit {

  currentRole = 'QA_OFFICER';
  searchText = '';
  applications: any[] = [];

  stats = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  };

  constructor(
    private router: Router,
    private applicationService: ApplicationFormService
  ) { }

  ngOnInit() {
    this.currentRole = localStorage.getItem('role') || 'QA_OFFICER';
    this.getData();
  }

  getData() {
    // Fetch all applications (role-aware on backend)
    this.applicationService.getApplications({ agentId: '' }).subscribe({
      next: (res: any) => {
        if (res && res.applications) {
          this.applications = res.applications;
          this.calculateStats();
        }
      },
      error: (err) => {
        console.error('Error fetching dashboard applications:', err);
      }
    });
  }

  calculateStats() {
    let pending = 0;
    let completed = 0;
    let rejected = 0;
    let inProgress = 0;

    this.applications.forEach(app => {
      const stage = app.currentStage;
      if (stage === 'COMPLETED') {
        completed++;
      } else if (stage === 'APP_REJECTED' || stage === 'CLOSED_LOST') {
        rejected++;
      } else if (['NEW_APP', 'QA_REVIEW', 'APP_REVIEW', 'CAS_REVIEW', 'ENROLMENT'].includes(stage)) {
        pending++;
      } else {
        inProgress++;
      }
    });

    this.stats = { pending, inProgress, completed, rejected };
  }

  get filteredApplications() {
    // 1. First filter by search text
    let list = this.applications;
    const search = this.searchText.toLowerCase().trim();
    
    if (search) {
      list = list.filter(app =>
        (app.studentName?.toLowerCase().includes(search) || '') ||
        (app.courseName?.toLowerCase().includes(search) || '') ||
        (app.universityName?.toLowerCase().includes(search) || '')
      );
    }

    // 2. Filter based on Role requirements from Spec
    if (this.currentRole === 'QA_OFFICER') {
      return list.filter(app => ['NEW_APP', 'QA_REVIEW'].includes(app.currentStage));
    } else if (this.currentRole === 'ADMISSION_OFFICER') {
      return list.filter(app => ['APP_REVIEW', 'DECISION'].includes(app.currentStage));
    } else if (this.currentRole === 'VISA_OFFICER') {
      return list.filter(app => ['DEPOSIT', 'CAS_REVIEW'].includes(app.currentStage));
    } else if (this.currentRole === 'ENROLMENT_OFFICER') {
      return list.filter(app => ['ENROLMENT'].includes(app.currentStage));
    }
    
    // Admins, Counselors see everything
    return list;
  }

  openApplication(app: any) {
    const stage = app.currentStage;
    
    // Dynamic routing based on stage
    if (['NEW_APP', 'QA_REVIEW'].includes(stage)) {
      this.router.navigate(['/qa-review', app._id]);
    } else if (stage === 'APP_REVIEW') {
      this.router.navigate(['/admission-review', app._id]);
    } else if (stage === 'DECISION') {
      this.router.navigate(['/decision-review', app._id]);
    } else if (['DEPOSIT', 'CAS_REVIEW'].includes(stage)) {
      this.router.navigate(['/visa-review', app._id]);
    } else if (stage === 'ENROLMENT') {
      this.router.navigate(['/enrolment-review', app._id]);
    } else {
      // Default fallback
      this.router.navigate(['/qa-review', app._id]);
    }
  }
}