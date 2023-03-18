import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date, ...args: number[]): unknown {
    const date = new Date(value);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString();

    const format = args[0];
    if (format === 1) {
      return day + month + year;
    } else if (format === 2) {
      return day + ' / ' + month + ' / ' + year;
    } else if (format === 3) {
      return day + '/' + month + '/' + year;
    } else if (format === 4) {
      return year + '-' + month + '-' + day;
    } else {
      // handle invalid format argument
      return value;
    }
  }
}

// transform(value: string, format: number): string {
