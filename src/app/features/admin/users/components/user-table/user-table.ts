import { AfterViewInit, Component, effect, input, output, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { User } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-user-table',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './user-table.html',
  styleUrl: './user-table.scss',
})
export class UserTable implements AfterViewInit {
  data = input<User[]>([]);

  edit = output<User>();
  view = output<User>();
  delete = output<User>();

  readonly displayedColumns = ['name', 'email', 'role', 'state', 'actions'];

  readonly roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    EXHIBITOR: 'Expositor',
    VISITOR: 'Visitante',
  };

  dataSource = new MatTableDataSource<User>([]);

  sort = viewChild.required(MatSort);
  paginator = viewChild.required(MatPaginator);

  constructor() {
    effect(() => {
      this.dataSource.data = this.data();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort();
    this.dataSource.paginator = this.paginator();

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':  return (item.name ?? '').toLowerCase();
        case 'email': return item.email.toLowerCase();
        case 'role':  return item.role;
        case 'state': return item.state;
        default:      return '';
      }
    };
  }
}
