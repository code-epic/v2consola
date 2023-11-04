import { Pipe, PipeTransform } from '@angular/core';
import * as SqlFormatter from 'sql-formatter';

@Pipe({
  name: 'sqlFormat'
})
export class SqlFormatPipe implements PipeTransform {
  transform(value: string): string {
    const regex = /\$0/g;
    const formattedSql = SqlFormatter.format(value.replace(regex, ''));
    return formattedSql;
  }
}