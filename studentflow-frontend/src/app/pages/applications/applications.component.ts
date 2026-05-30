import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ApplicationFormService } from '../application-form/application-form.service';

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
  applications: any[] = [];

  constructor(
    private router: Router,
    private applicationService: ApplicationFormService,

  ) { }

  ngOnInit() {
    this.getApplications();
  }

  get filteredApplications() {
    const search = this.searchText.toLowerCase();

    return this.applications.filter(app =>
      app.studentName.toLowerCase().includes(search) ||
      app.studentEmail.toLowerCase().includes(search) ||
      app.phoneNumber.includes(search)
    );
  }

  openApplication(id: string) {
    this.router.navigate(['/agent-application-status', id]);
  }

  addApplication() {
    this.router.navigate(['/application-form']);
  }

  getApplications() {
    const postData = {
      agentId: localStorage.getItem('userId') as string,
    }

    console.log()

    this.applicationService.getApplications(postData).subscribe({
      next: (res: any) => {
        this.applications = res.applications;
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}