import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'myNewPipe'
})
export class MyNewPipePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        return '$'+value;
    }

}
