import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ApplicationFormService } from '../application-form/application-form.service';

@Component({
  selector: 'app-admission-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    TabsModule,
    SelectButtonModule
  ],
  templateUrl: './admission-review.component.html',
  styleUrl: './admission-review.component.scss'
})
export class AdmissionReviewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private applicationService = inject(ApplicationFormService);

  applicationId = '';
  student: any = {};
  documents: any[] = [];
  publicNotes: any[] = [];
  internalNotes: any[] = [];

  aiReview = {
    readiness: 'Medium',
    missingDocuments: ['Statement of Purpose'],
    risks: ['IELTS score slightly below preferred requirement']
  };

  decisionOptions = [
    { label: 'Unconditional Offer', value: 'UNCONDITIONAL' },
    { label: 'Conditional Offer', value: 'CONDITIONAL' },
    { label: 'Reject', value: 'REJECT' }
  ];

  offerConditions = '';
  decisionReason = '';
  selectedDecision = 'CONDITIONAL';

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
          this.documents = app.documents || [];
          
          // Filter notes
          const allNotes = app.notes || [];
          this.publicNotes = allNotes.filter((n: any) => n.visibility === 'PUBLIC');
          this.internalNotes = allNotes.filter((n: any) => n.visibility === 'INTERNAL');
        }
      },
      error: (err) => {
        console.error('Error fetching application for Admissions:', err);
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

  viewDocument(doc: any) {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else {
      alert('No document file URL available');
    }
  }

  rejectApplication() {
    this.applicationService.updateApplicationStage(this.applicationId, 'APP_REJECTED').subscribe({
      next: (res: any) => {
        alert('Application rejected successfully');
        this.router.navigate(['/internal-dashboard']);
      },
      error: (err) => {
        console.error('Error rejecting application:', err);
        alert('Failed to reject: ' + err.message);
      }
    });
  }

  moveToDecision() {
    // Moves to DECISION stage
    this.applicationService.updateApplicationStage(this.applicationId, 'DECISION').subscribe({
      next: (res: any) => {
        alert('Application successfully moved to Decision stage');
        this.router.navigate(['/internal-dashboard']);
      },
      error: (err) => {
        console.error('Error moving application to Decision:', err);
        alert('Failed to update stage: ' + err.message);
      }
    });
  }
}