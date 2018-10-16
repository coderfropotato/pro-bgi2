import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "accuracy"
})
export class AccuracyPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (args == -1) return value;
        if (!isNaN(value)) {
            var f = parseFloat(value);
            if (isNaN(f)) {
                return value;
            } else {
                return this.toAccuracy(value, args);
            }
        } else {
            return value;
        }
    }

    toAccuracy(value, args) {
        if (isNaN(parseFloat(value))) {
            return value;
        } else {
            let t = 1;
            let num = args;
            for (; args > 0; t *= 10, args--);
            for (; args < 0; t /= 10, args++);

            let rlt = Math.round(value * t) / t;
            let rltText = "";
            rltText = rlt.toString();
            let rs = rltText.indexOf(".");
            if (rs < 0) {
                rs = rltText.length;
                rltText += ".";
            }
            rs = Number(rs) + Number(num);
            while (rltText.length <= rs) {
                rltText += "0";
            }
            return rltText;
        }
    }
}
