import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: 'login',
        canActivate: [noAuthGuard],
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'agent-signup',
        canActivate: [noAuthGuard],
        loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent)
    },
    {
        path: 'applications',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['AGENT', 'ADMIN'] },
        loadComponent: () => import('./pages/applications/applications.component').then(m => m.ApplicationsComponent)
    },
    {
        path: 'application-form',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['AGENT', 'ADMIN'] },
        loadComponent: () => import('./pages/application-form/application-form.component').then(m => m.ApplicationFormComponent)
    },
    {
        path: 'agent-application-status/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['AGENT', 'ADMIN'] },
        loadComponent: () => import('./pages/agent-application-status/agent-application-status.component').then(m => m.AgentApplicationStatusComponent)
    },
    {
        path: 'qa-review/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['QA_OFFICER', 'ADMIN'] },
        loadComponent: () => import('./pages/qa-review/qa-review.component').then(m => m.QaReviewComponent)
    },
    {
        path: 'internal-dashboard',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['QA_OFFICER', 'ADMISSION_OFFICER', 'VISA_OFFICER', 'ENROLMENT_OFFICER', 'ADMIN'] },
        loadComponent: () => import('./pages/internal-dashboard/internal-dashboard.component').then(m => m.InternalDashboardComponent)
    },
    {
        path: 'admission-review/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMISSION_OFFICER', 'ADMIN'] },
        loadComponent: () => import('./pages/admission-review/admission-review.component').then(m => m.AdmissionReviewComponent)
    },
    {
        path: 'decision-review/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMISSION_OFFICER', 'ADMIN'] },
        loadComponent: () => import('./pages/decision-review/decision-review.component').then(m => m.DecisionReviewComponent)
    },
    {
        path: 'visa-review/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['VISA_OFFICER', 'ADMIN'] },
        loadComponent: () => import('./pages/visa-review/visa-review.component').then(m => m.VisaReviewComponent)
    },
    {
        path: 'enrolment-review/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ENROLMENT_OFFICER', 'ADMIN'] },
        loadComponent: () => import('./pages/enrolment-review/enrolment-review.component').then(m => m.EnrolmentReviewComponent)
    },
    {
        path: 'admin-users',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
    },
    {
        path: 'admin-dashboard',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
