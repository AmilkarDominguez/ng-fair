import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
    ],
  },
  {
    path: '',
    component: AdminLayout,
    // canActivate: [authGuard]
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./features/admin/users/user-dashboard').then((m) => m.UserDashboard),
      },
      {
        path: 'admin/fair-editions',
        loadComponent: () =>
          import('./features/admin/fair-editions/fair-edition-dashboard').then((m) => m.FairEditionDashboard),
      },
      {
        path: 'admin/categories',
        loadComponent: () =>
          import('./features/admin/categories/category-dashboard').then((m) => m.CategoryDashboard),
      },
      {
        path: 'admin/exhibitors',
        loadComponent: () =>
          import('./features/admin/exhibitors/exhibitor-dashboard').then((m) => m.ExhibitorDashboard),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
