import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { ApplicationFormService } from '../application-form/application-form.service';
import { getStageFullDisplay } from '../../core/utils/stage.utils';

@Component({
  selector: 'app-visa-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    TabsModule
  ],
  templateUrl: './visa-review.component.html',
  styleUrl: './visa-review.component.scss'
})
export class VisaReviewComponent implements OnInit {

  getStageDisplay(stage: string): string {
    return getStageFullDisplay(stage);
  }

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private applicationService = inject(ApplicationFormService);

  applicationId = '';
  student: any = {};
  publicNotes: any[] = [];
  internalNotes: any[] = [];

  visaChecklist = [
    { label: 'Passport', completed: true },
    { label: 'Offer Letter', completed: true },
    { label: 'Deposit Paid', completed: true },
    { label: 'CAS Letter', completed: true },
    { label: 'Financial Documents', completed: false },
    { label: 'Visa Application Form', completed: true }
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
        console.error('Error fetching application for Visa review:', err);
      }
    });
  }

  addPublicNote() {
    if (!this.newPublicNote.trim()) return;

    const userName = localStorage.getItem('name') || 'Visa Officer';
    const userRole = localStorage.getItem('role') || 'VISA_OFFICER';

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

    const userName = localStorage.getItem('name') || 'Visa Officer';
    const userRole = localStorage.getItem('role') || 'VISA_OFFICER';

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

  approveVisaStage() {
    const currentStage = this.student?.currentStage || 'DEPOSIT';
    const nextStage = currentStage === 'DEPOSIT' ? 'CAS_REVIEW' : 'ENROLMENT';

    this.applicationService.updateApplicationStage(this.applicationId, nextStage).subscribe({
      next: (res: any) => {
        const stageMsg = nextStage === 'CAS_REVIEW' ? 'moved to CAS Review stage' : 'moved to Enrolment stage';
        alert(`Visa stage approved, application successfully ${stageMsg}`);
        this.router.navigate(['/internal-dashboard']);
      },
      error: (err) => {
        console.error(`Error transitioning to ${nextStage} stage:`, err);
        alert('Failed to update stage: ' + err.message);
      }
    });
  }

  rejectApplication() {
    this.applicationService.updateApplicationStage(this.applicationId, 'APP_REJECTED').subscribe({
      next: (res: any) => {
        alert('Application rejected');
        this.router.navigate(['/internal-dashboard']);
      },
      error: (err) => {
        console.error('Error rejecting application:', err);
        alert('Failed to reject: ' + err.message);
      }
    });
  }
}