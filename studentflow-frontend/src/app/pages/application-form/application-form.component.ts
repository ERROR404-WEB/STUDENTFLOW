import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';

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
    { key: 'photo', label: 'Student Photo' },
    { key: 'passport', label: 'Passport' },
    { key: 'academic', label: 'Academic Documents' },
    { key: 'englishTest', label: 'English Test / IELTS' },
    { key: 'sop', label: 'Statement of Purpose' },
    { key: 'cv', label: 'CV / Resume' }
  ];

  uploadedDocs: Record<string, File> = {};

  onFileSelect(event: any, key: string) {
    const file = event.files?.[0];

    if (file) {
      this.uploadedDocs[key] = file;
    }
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
      documents: Object.keys(this.uploadedDocs)
    };

    console.log('Application Payload:', payload);
  }
}