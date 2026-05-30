import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { ApplicationFormService } from '../application-form/application-form.service';

@Component({
  selector: 'app-enrolment-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    TabsModule
  ],
  templateUrl: './enrolment-review.component.html',
  styleUrl: './enrolment-review.component.scss'
})
export class EnrolmentReviewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private applicationService = inject(ApplicationFormService);

  applicationId = '';
  student: any = {};
  publicNotes: any[] = [];
  internalNotes: any[] = [];

  checklist = [
    { label: 'Offer Accepted', completed: true },
    { label: 'Deposit Paid', completed: true },
    { label: 'Visa Approved', completed: true },
    { label: 'Student Arrived', completed: true },
    { label: 'University Registered', completed: false }
  ];

  newPublicNote = '';
  newInternalNote = '';

  ngOnInit() {
    this.applicationId = this.route.snapshot.paramMap.get('id') || '';
    this.getData();
  }

  getData() {
    this.applicationService.getAgentApplicationStatus(this.applicationId).subscribe({
      next: (res: any) => {
        if (res && res.application) {
          const app = res.application;
          this.student = app;
          
          // Filter notes
          const allNotes = app.notes || [];
          this.publicNotes = allNotes.filter((n: any) => n.visibility === 'PUBLIC');
          this.internalNotes = allNotes.filter((n: any) => n.visibility === 'INTERNAL');
        }
      },
      error: (err) => {
        console.error('Error fetching application for Enrolment review:', err);
      }
    });
  }

  addPublicNote() {
    if (!this.newPublicNote.trim()) return;

    const userName = localStorage.getItem('name') || 'Enrolment Officer';
    const userRole = localStorage.getItem('role') || 'ENROLMENT_OFFICER';

    this.applicationService.addApplicationNote(
      this.applicationId,
      this.newPublicNote,
      'PUBLIC',
      userName,
      userRole
    ).subscribe({
      next: (res: any) => {
        this.newPublicNote = '';
        this.getData();
      },
      error: (err) => {
        console.error('Error adding public note:', err);
      }
    });
  }

  addInternalNote() {
    if (!this.newInternalNote.trim()) return;

    const userName = localStorage.getItem('name') || 'Enrolment Officer';
    const userRole = localStorage.getItem('role') || 'ENROLMENT_OFFICER';

    this.applicationService.addApplicationNote(
      this.applicationId,
      this.newInternalNote,
      'INTERNAL',
      userName,
      userRole
    ).subscribe({
      next: (res: any) => {
        this.newInternalNote = '';
        this.getData();
      },
      error: (err) => {
        console.error('Error adding internal note:', err);
      }
    });
  }

  markEnrolled() {
    this.applicationService.updateApplicationStage(this.applicationId, 'COMPLETED').subscribe({
      next: (res: any) => {
        alert('Student successfully marked as Enrolled & Completed!');
        this.router.navigate(['/internal-dashboard']);
      },
      error: (err) => {
        console.error('Error marking student enrolled:', err);
        alert('Failed to update stage: ' + err.message);
      }
    });
  }
}