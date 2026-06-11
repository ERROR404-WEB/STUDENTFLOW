import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApplicationFormService {

  private http = inject(HttpClient);
  private url = environment.baseUrl;

  constructor() { }

  submitApplication(postData: any) {
    return this.http.post(`${this.url}/api/applications`, postData);
  }

  getApplications(data: { agentId: string }) {
    return this.http.get(`${this.url}/api/applications`, { params: data });
  }

  getAgentApplicationStatus(id: string) {
    return this.http.get(`${this.url}/api/applications/${id}`);
  }

  updateApplicationStage(id: string, stage: string) {
    return this.http.patch(`${this.url}/api/applications/${id}/stage`, { stage });
  }

  updateApplication(id: string, updates: any) {
    return this.http.patch(`${this.url}/api/applications/${id}`, updates);
  }

  addApplicationNote(id: string, text: string, visibility: string, addedByName: string, role: string) {
    return this.http.post(`${this.url}/api/applications/${id}/notes`, { text, visibility, addedByName, role });
  }

  verifyApplicationDocument(id: string, docKey: string, verified: boolean) {
    return this.http.patch(`${this.url}/api/applications/${id}/documents/${docKey}/verify`, { verified });
  }

}
