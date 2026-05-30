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
    if (!this.student || !this.student.stage) {
      return 0; // Default to first step (Submitted) if not loaded yet
    }

    const stage = this.student.stage.toUpperCase();

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
        return 4; // Enrolled
      case 'APP_REJECTED':
      case 'CLOSED_LOST':
        return 2; // Decision
      default:
        return 0;
    }
  }

  documents = [
    { name: 'Passport', uploaded: true, fileName: 'passport.pdf' },
    { name: 'Academic Documents', uploaded: true, fileName: 'academic.pdf' },
    { name: 'IELTS', uploaded: true, fileName: 'ielts.pdf' },
    { name: 'Statement of Purpose', uploaded: false, fileName: '' },
    { name: 'CV / Resume', uploaded: true, fileName: 'cv.pdf' }
  ];

  notes = [
    {
      addedByName: 'QA Officer',
      role: 'QA_OFFICER',
      text: 'Passport and academic documents verified successfully.'
    },
    {
      addedByName: 'Agent',
      role: 'AGENT',
      text: 'Student uploaded IELTS scorecard.'
    },
    {
      addedByName: 'Admission Officer',
      role: 'ADMISSION_OFFICER',
      text: 'Application moved for university review.'
    }
  ];

  newNote = '';
  applicationId = '';

  ngOnInit() {
    this.applicationId = this.route.snapshot.paramMap.get('id') as string;
    this.getAgentApplicationStatus();

  };

  addNote() {
    if (!this.newNote.trim()) return;

    this.notes.push({
      addedByName: 'Agent',
      role: 'AGENT',
      text: this.newNote
    });

    this.newNote = '';
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
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}