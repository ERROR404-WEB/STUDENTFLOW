import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { ApplicationFormService } from './application-form.service';
import { Router } from '@angular/router';

type UploadedDocs = Record<string, File>;

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    SelectModule,
    FileUploadModule
  ],
  templateUrl: './application-form.component.html',
  styleUrl: './application-form.component.scss'
})
export class ApplicationFormComponent {
  studentName = '';
  studentEmail = '';
  phoneNumber = '';
  nationality = '';
  courseName = '';
  universityName = '';
  intakeMonth = 'September';
  intakeYear = new Date().getFullYear();
  agentNote = '';

  intakeMonths = [
    { label: 'January', value: 'January' },
    { label: 'May', value: 'May' },
    { label: 'September', value: 'September' }
  ];

  requiredDocs = [
    { key: 'passport', name: 'Passport' },
    { key: 'academic', name: 'Academic Documents' },
    { key: 'englishTest', name: 'English Test / IELTS' },
    { key: 'sop', name: 'Statement of Purpose' },
    { key: 'cv', name: 'CV / Resume' }
  ];

  uploadedDocs: UploadedDocs = {};

  constructor(
    private applicationService: ApplicationFormService,
    private router: Router
  ) {

  }

  onFileSelect(event: any, key: string) {
    const file = event.files?.[0];

    if (file) {
      this.uploadedDocs[key] = file;
    }
  }

  getDocumentsForPayload() {
    return this.requiredDocs
      .filter((doc) => !!this.uploadedDocs[doc.key])
      .map((doc) => {
        const file = this.uploadedDocs[doc.key];

        return {
          key: doc.key,
          name: doc.name,
          fileName: file.name,
          mimeType: file.type,
          uploaded: true,
          uploadedAt: new Date()
        };
      });
  }

  submitApplication() {
    const payload = {
      studentName: this.studentName,
      studentEmail: this.studentEmail,
      phoneNumber: this.phoneNumber,
      nationality: this.nationality,
      courseName: this.courseName,
      universityName: this.universityName,
      intakeMonth: this.intakeMonth,
      intakeYear: this.intakeYear,
      agentNote: this.agentNote,
      documents: this.getDocumentsForPayload()
    };

    this.applicationService.submitApplication(payload).subscribe({
      next: (res: any) => {
        this.router.navigate(['/applications']);
      }
    })
  }
}