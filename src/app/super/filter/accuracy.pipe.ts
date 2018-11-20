import { Pipe, PipeTransform } from "@angular/core";
/**
 * @description 精度过滤器
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class AccuracyPipe
 * @implements {PipeTransform}
 * init 千分位
 * double 精度
 * string不处理
 */
@Pipe({
    name: "accuracyPipe"
})
export class AccuracyPipe implements PipeTransform {
    transform(value: any, args?: any, type?: any): any {
        if (type == "string") {
            return value;
        } else {
            if (type === "double") {
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
            } else if (type == "int") {
                return this.toThousands(value);
            } else{
                return value;
            }
        }
    }

    toThousands(num) {
        let number = (num || 0).toString(),
            result = "";
        while (number.length > 3) {
            result = "," + number.slice(-3) + result;
            number = number.slice(0, number.length - 3);
        }
        if (number) {
            result = number + result;
        }
        return result;
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
