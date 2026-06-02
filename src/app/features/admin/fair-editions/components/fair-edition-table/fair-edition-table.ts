import { AfterViewInit, Component, effect, input, output, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FairEdition } from '../../../../../core/models/fair-edition.model';

@Component({
  selector: 'app-fair-edition-table',
  imports: [
    DatePipe,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './fair-edition-table.html',
  styleUrl: './fair-edition-table.scss',
})
export class FairEditionTable implements AfterViewInit {
  data = input<FairEdition[]>([]);

  edit = output<FairEdition>();
  view = output<FairEdition>();
  delete = output<FairEdition>();

  readonly displayedColumns = ['name', 'start_date', 'end_date', 'state', 'actions'];

  dataSource = new MatTableDataSource<FairEdition>([]);

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
        case 'name':       return item.name.toLowerCase();
        case 'start_date': return item.start_date ?? '';
        case 'end_date':   return item.end_date ?? '';
        case 'state':      return item.state;
        default:           return '';
      }
    };
  }
}
