import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'agent-signup',
        loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent)
    },
    {
        path: 'applications',
        loadComponent: () => import('./pages/applications/applications.component').then(m => m.ApplicationsComponent)
    },
    {
        path: 'application-form',
        loadComponent: () => import('./pages/application-form/application-form.component').then(m => m.ApplicationFormComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
