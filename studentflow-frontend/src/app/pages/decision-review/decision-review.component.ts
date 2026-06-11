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
  selector: 'app-decision-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    TabsModule
  ],
  templateUrl: './decision-review.component.html',
  styleUrl: './decision-review.component.scss'
})
export class DecisionReviewComponent implements OnInit {

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

  decision = {
    type: 'CONDITIONAL_OFFER',
    conditions: [
      'Submit final academic transcript',
      'Provide updated IELTS score'
    ],
    offerLetter: 'offer-letter.pdf'
  };

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
        console.error('Error fetching application for Decision review:', err);
      }
    });
  }

  addPublicNote() {
    if (!this.newPublicNote.trim()) return;

    const userName = localStorage.getItem('name') || 'Admission Officer';
    const userRole = localStorage.getItem('role') || 'ADMISSION_OFFICER';

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

    const userName = localStorage.getItem('name') || 'Admission Officer';
    const userRole = localStorage.getItem('role') || 'ADMISSION_OFFICER';

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

  viewOfferLetter() {
    alert('Offer letter downloaded/opened (pdf preview)');
  }

  moveToDeposit() {
    this.applicationService.updateApplicationStage(this.applicationId, 'DEPOSIT').subscribe({
      next: (res: any) => {
        alert('Application moved to Deposit Paid stage');
        this.router.navigate(['/internal-dashboard']);
      },
      error: (err) => {
        console.error('Error transitioning to DEPOSIT stage:', err);
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