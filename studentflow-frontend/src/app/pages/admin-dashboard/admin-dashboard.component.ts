import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RouterModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private url = environment.baseUrl;

  stats: any[] = [];
  stages: any[] = [];
  recentActivities: string[] = [];

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get<any>(`${this.url}/api/applications/stats/dashboard`).subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.stages = res.stages;
        this.recentActivities = res.recentActivities;
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
      }
    });
  }
}