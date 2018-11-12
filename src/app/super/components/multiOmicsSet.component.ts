import { Component,OnInit} from '@angular/core';

@Component({
    selector:'app-multiOmicsSet',
    templateUrl:'./multiOmicsSet.component.html',
    styles:[
        `
        .setPanel {
            top: 11px;
            right: 0;
            width: 300px;
        }

        .setPanelTitle {
            border-bottom: $border;
        }

        .addInfo {
            padding: 10px;
        }
        `
    ]
})

export class MultiOmicsSetComponent implements OnInit{
    ngOnInit(){

    }
}
