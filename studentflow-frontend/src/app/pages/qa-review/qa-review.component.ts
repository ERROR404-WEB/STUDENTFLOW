import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ApplicationFormService } from '../application-form/application-form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { getStageFullDisplay } from '../../core/utils/stage.utils';

@Component({
  selector: 'app-qa-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    CheckboxModule,
    TabsModule
  ],
  templateUrl: './qa-review.component.html',
  styleUrl: './qa-review.component.scss'
})
export class QaReviewComponent {

  getStageDisplay(stage: string): string {
    return getStageFullDisplay(stage);
  }

  student: any = {
    studentName: '',
    studentEmail: '',
    universityName: '',
    courseName: ''
  };

  application: any = {
    currentStage: 'NEW_APP',
    previousStage: '-',
    nextStage: 'QA_REVIEW'
  };

  aiReview = {
    readiness: 'Medium',
    missingDocuments: ['Statement of Purpose'],
    risks: ['IELTS score below preferred requirement']
  };

  documents: any[] = [];
  applicationId = '';

  publicNotes: any[] = [];
  internalNotes: any[] = [];

  newPublicNote = '';
  newInternalNote = '';

  constructor(
    private applicationService: ApplicationFormService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.applicationId = this.route.snapshot.paramMap.get('id') as string;
    this.getData();
  }

  getData() {
    this.applicationService.getAgentApplicationStatus(this.applicationId).subscribe({
      next: (res: any) => {
        if (res && res.application) {
          const app = res.application;
          this.student = app;

          if (app.currentStage === 'NEW_APP') {
            this.applicationService.updateApplicationStage(this.applicationId, 'QA_REVIEW').subscribe({
              next: () => {
                this.student.currentStage = 'QA_REVIEW';
                this.getData();
              },
              error: (err) => {
                console.error('Error auto-transitioning to QA_REVIEW:', err);
              }
            });
            return;
          }

          const notes = app.notes || [];

          this.publicNotes = notes.filter(
            (n: any) => n.visibility === 'PUBLIC'
          );

          this.internalNotes = notes.filter(
            (n: any) => n.visibility === 'INTERNAL'
          );

          // Map documents from DB, defaulting verified field
          if (app.documents && app.documents.length > 0) {
            this.documents = app.documents.map((d: any) => ({
              ...d,
              verified: d.verified ?? false
            }));
          }

          // Calculate stage positions dynamically
          const stages = ["NEW_APP", "QA_REVIEW", "APP_REVIEW", "DECISION", "DEPOSIT", "CAS_REVIEW", "ENROLMENT"];
          const currentIdx = stages.indexOf(app.currentStage);

          const previousStage = currentIdx > 0 ? stages[currentIdx - 1] : '-';
          const nextStage = currentIdx >= 0 && currentIdx < stages.length - 1 ? stages[currentIdx + 1] : '-';

          this.application = {
            ...app,
            currentStage: app.currentStage || 'NEW_APP',
            previousStage: previousStage,
            nextStage: nextStage
          };
        }
      },
      error: (err) => {
        console.error('Error fetching QA review application:', err);
      }
    });
  }

  viewDocument(doc: any) {
    console.log('Viewing document:', doc);
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else {
      alert(`Document file not uploaded yet or URL missing for: ${doc.name}`);
    }
  }

  verifyDocument(doc: any) {
    this.applicationService.verifyApplicationDocument(this.applicationId, doc.key, true).subscribe({
      next: (res: any) => {
        doc.verified = true;
        console.log('Document verified in DB:', doc);
      },
      error: (err) => {
        console.error('Error verifying document:', err);
      }
    });
  }

  rejectApplication() {
    this.applicationService.updateApplicationStage(this.applicationId, 'APP_REJECTED').subscribe({
      next: (res: any) => {
        alert('Application rejected');
        const role = localStorage.getItem('role');
        if (role === 'AGENT') {
          this.router.navigate(['/applications']);
        } else {
          this.router.navigate(['/internal-dashboard']);
        }
      },
      error: (err) => {
        console.error('Error rejecting application:', err);
      }
    });
  }

  moveToAppReview() {
    this.applicationService.updateApplicationStage(this.applicationId, 'APP_REVIEW').subscribe({
      next: (res: any) => {
        alert('Application successfully moved to Application Review');
        const role = localStorage.getItem('role');
        if (role === 'AGENT') {
          this.router.navigate(['/applications']);
        } else {
          this.router.navigate(['/internal-dashboard']);
        }
      },
      error: (err) => {
        console.error('Error moving application:', err);
      }
    });
  }

  addPublicNote() {
    if (!this.newPublicNote.trim()) return;

    const userName = localStorage.getItem('name') || 'QA Officer';
    const userRole = localStorage.getItem('role') || 'QA_OFFICER';

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
        console.error('Error adding note:', err);
      }
    });
  }

  addInternalNote() {
    if (!this.newInternalNote.trim()) return;

    const userName = localStorage.getItem('name') || 'QA Officer';
    const userRole = localStorage.getItem('role') || 'QA_OFFICER';

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
        console.error('Error adding note:', err);
      }
    });
  }
}