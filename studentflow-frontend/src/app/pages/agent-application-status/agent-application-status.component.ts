import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ApplicationFormService } from '../application-form/application-form.service';
import { getStageFullDisplay } from '../../core/utils/stage.utils';

@Component({
  selector: 'app-agent-application-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TextareaModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './agent-application-status.component.html',
  styleUrl: './agent-application-status.component.scss'
})
export class AgentApplicationStatusComponent {
  isEditing = false;
  editForm: any = {};
  intakeMonths = [
    { label: 'January', value: 'January' },
    { label: 'May', value: 'May' },
    { label: 'September', value: 'September' }
  ];

  getStageDisplay(stage: string): string {
    return getStageFullDisplay(stage);
  }

  constructor(
    private router: Router,
    private applicationService: ApplicationFormService,
    private route: ActivatedRoute

  ) { }


  student: any = {};

  get role(): string {
    return localStorage.getItem('role') || '';
  }

  get isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  get statuses(): string[] {
    if (this.isAdmin) {
      return [
        'Submitted',
        'QA Review',
        'App Review',
        'Decision',
        'Deposit',
        'CAS Review',
        'Enrolment',
        'Completed'
      ];
    } else {
      return [
        'Submitted',
        'Processing',
        'Decision',
        'Deposit',
        'Enrolled'
      ];
    }
  }

  get currentIndex(): number {
    const stageVal = this.student?.currentStage || this.student?.stage;
    if (!stageVal) {
      return 0; // Default to first step (Submitted) if not loaded yet
    }

    const stage = stageVal.toUpperCase();

    if (this.isAdmin) {
      switch (stage) {
        case 'NEW_APP':
          return 0;
        case 'QA_REVIEW':
          return 1;
        case 'APP_REVIEW':
          return 2;
        case 'DECISION':
          return 3;
        case 'DEPOSIT':
          return 4;
        case 'CAS_REVIEW':
          return 5;
        case 'ENROLMENT':
          return 6;
        case 'COMPLETED':
          return 7;
        case 'APP_REJECTED':
        case 'CLOSED_LOST':
          return 3; // Highlight up to Decision
        default:
          return 0;
      }
    } else {
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

  startEdit() {
    this.editForm = {
      studentName: this.student.studentName,
      studentEmail: this.student.studentEmail,
      phoneNumber: this.student.phoneNumber,
      nationality: this.student.nationality,
      courseName: this.student.courseName,
      universityName: this.student.universityName,
      intakeMonth: this.student.intakeMonth,
      intakeYear: this.student.intakeYear
    };
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveApplication() {
    if (
      !this.editForm.studentName?.trim() ||
      !this.editForm.studentEmail?.trim() ||
      !this.editForm.phoneNumber?.trim() ||
      !this.editForm.nationality?.trim() ||
      !this.editForm.courseName?.trim() ||
      !this.editForm.universityName?.trim() ||
      !this.editForm.intakeMonth ||
      !this.editForm.intakeYear
    ) {
      alert('All fields are required.');
      return;
    }

    this.applicationService.updateApplication(this.applicationId, this.editForm).subscribe({
      next: (res: any) => {
        this.isEditing = false;
        this.getAgentApplicationStatus();
      },
      error: (err) => {
        console.error('Error saving application:', err);
        alert('Failed to save changes: ' + err.message);
      }
    });
  }

  viewDocument(doc: any) {
    if (doc.uploaded && doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else if (doc.uploaded) {
      window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
    } else {
      alert(`Document "${doc.name}" is missing.`);
    }
  }

  replaceDocument(doc: any) {
    const fileName = prompt(`Enter file name for ${doc.name}:`, doc.fileName || `${doc.key}.pdf`);
    if (!fileName || !fileName.trim()) return;

    const updatedDocs = this.documents.map((d: any) => {
      if (d.key === doc.key) {
        return {
          ...d,
          fileName: fileName.trim(),
          uploaded: true,
          uploadedAt: new Date()
        };
      }
      return d;
    });

    this.applicationService.updateApplication(this.applicationId, { documents: updatedDocs }).subscribe({
      next: (res: any) => {
        this.getAgentApplicationStatus();
      },
      error: (err) => {
        console.error('Error replacing document:', err);
        alert('Failed to update document: ' + err.message);
      }
    });
  }

  uploadDocument() {
    const firstMissing = this.documents.find(d => !d.uploaded);
    if (firstMissing) {
      this.replaceDocument(firstMissing);
    } else {
      alert('All required documents have already been uploaded.');
    }
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