import { AfterViewInit, Component, effect, input, output, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Exhibitor } from '../../../../../core/models/exhibitor.model';

@Component({
  selector: 'app-exhibitor-table',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './exhibitor-table.html',
  styleUrl: './exhibitor-table.scss',
})
export class ExhibitorTable implements AfterViewInit {
  data = input<Exhibitor[]>([]);

  edit = output<Exhibitor>();
  view = output<Exhibitor>();
  delete = output<Exhibitor>();

  readonly displayedColumns = ['company_name', 'sector', 'edition', 'state', 'actions'];

  dataSource = new MatTableDataSource<Exhibitor>([]);

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
        case 'company_name': return (item.company_name ?? '').toLowerCase();
        case 'sector':       return (item.sector ?? '').toLowerCase();
        case 'edition':      return (item.edition?.name ?? '').toLowerCase();
        case 'state':        return item.state;
        default:             return '';
      }
    };
  }
}
