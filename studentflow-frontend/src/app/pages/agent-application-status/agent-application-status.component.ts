import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ApplicationFormService } from '../application-form/application-form.service';

@Component({
  selector: 'app-agent-application-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule
  ],
  templateUrl: './agent-application-status.component.html',
  styleUrl: './agent-application-status.component.scss'
})
export class AgentApplicationStatusComponent {

  constructor(
    private router: Router,
    private applicationService: ApplicationFormService,
    private route: ActivatedRoute

  ) { }


  student: any = {};

  statuses = [
    'Submitted',
    'Processing',
    'Decision',
    'Deposit',
    'Enrolled'
  ];

  get currentIndex(): number {
    const stageVal = this.student?.currentStage || this.student?.stage;
    if (!stageVal) {
      return 0; // Default to first step (Submitted) if not loaded yet
    }

    const stage = stageVal.toUpperCase();

    switch (stage) {
      case 'NEW_APP':
        return 0; // Submitted
      case 'QA_REVIEW':
      case 'APP_REVIEW':
        return 1; // Processing
      case 'DECISION':
        return 2; // Decision
      case 'DEPOSIT':
      case 'CAS_REVIEW':
        return 3; // Deposit
      case 'ENROLMENT':
      case 'COMPLETED':
        return 4; // Enrolled
      case 'APP_REJECTED':
      case 'CLOSED_LOST':
        return 2; // Decision
      default:
        return 0;
    }
  }

  documents: any[] = [];
  notes: any[] = [];

  newNote = '';
  applicationId = '';

  ngOnInit() {
    this.applicationId = this.route.snapshot.paramMap.get('id') as string;
    this.getAgentApplicationStatus();

  };

  addNote() {
    if (!this.newNote.trim()) return;

    const text = this.newNote.trim();
    const addedByName = localStorage.getItem('name') || 'Agent';
    const role = localStorage.getItem('role') || 'AGENT';
    const visibility = 'PUBLIC';

    this.applicationService.addApplicationNote(this.applicationId, text, visibility, addedByName, role).subscribe({
      next: (res: any) => {
        if (res && res.application) {
          this.notes = res.application.notes || [];
        } else {
          this.notes.push({
            addedByName,
            role,
            text
          });
        }
        this.newNote = '';
      },
      error: (err) => {
        console.error('Error adding note:', err);
      }
    });
  }

  editApplication() {
    this.router.navigate(['/applications/edit/1']);
  }

  viewDocument(doc: any) {
    console.log('View', doc);
  }

  replaceDocument(doc: any) {
    console.log('Replace', doc);
  }

  uploadDocument() {
    console.log('Upload document');
  }

  getAgentApplicationStatus() {
    this.applicationService.getAgentApplicationStatus(this.applicationId).subscribe({
      next: (res: any) => {
        this.student = res.application;
        this.notes = res.application.notes || [];
        this.documents = res.application.documents || [];
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}