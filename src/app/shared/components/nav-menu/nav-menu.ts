import { Component, inject, output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavModule {
  title: string;
  icon: string;
  items: NavItem[];
}

@Component({
  selector: 'app-nav-menu',
  imports: [
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.scss',
})
export class NavMenu {
  onClick = output();

  readonly themeService = inject(ThemeService);

  readonly modules: NavModule[] = [
    {
      title: 'Admin',
      icon: 'admin_panel_settings',
      items: [
        { label: 'Usuarios', icon: 'people', route: '/admin/users' },
        { label: 'Ediciones de Feria', icon: 'event', route: '/admin/fair-editions' },
        { label: 'Categorías', icon: 'category', route: '/admin/categories' },
        { label: 'Expositores', icon: 'storefront', route: '/admin/exhibitors' },
        { label: 'Productos', icon: 'inventory_2', route: '/admin/products' },
        { label: 'Reuniones', icon: 'groups', route: '/admin/meetings' },
      ],
    },
    {
      title: 'Reportes',
      icon: 'bar_chart',
      items: [
        { label: 'Visitas por Producto', icon: 'visibility', route: '/reports/product-visits' },
      ],
    },
  ];

  clickMenu(): void {
    this.onClick.emit();
  }
}
