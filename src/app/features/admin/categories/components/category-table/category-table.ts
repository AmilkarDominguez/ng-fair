import { AfterViewInit, Component, effect, input, output, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Category } from '../../../../../core/models/category.model';

@Component({
  selector: 'app-category-table',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './category-table.html',
  styleUrl: './category-table.scss',
})
export class CategoryTable implements AfterViewInit {
  data = input<Category[]>([]);

  edit = output<Category>();
  view = output<Category>();
  delete = output<Category>();

  readonly displayedColumns = ['name', 'description', 'state', 'actions'];

  dataSource = new MatTableDataSource<Category>([]);

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
        case 'name':        return item.name.toLowerCase();
        case 'description': return (item.description ?? '').toLowerCase();
        case 'state':       return item.state;
        default:            return '';
      }
    };
  }
}
