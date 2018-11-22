import { ToolsService } from "./../service/toolsService";
import {
    Component,
    OnInit,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    EventEmitter
} from "@angular/core";
declare const $: any;
@Component({
    selector: "app-tools",
    templateUrl: "./tools.component.html",
    styles: []
})
export class ToolsComponent implements OnInit {
    toolList: object[] = [
        {
            name: "聚类重分析",
            desc:
                "横轴表示取log2后的差异倍数，即log2FoldChange。纵轴表示基因，默认配色下，色块的颜色越红表达量越高，颜色越蓝，表达量越低。"
        },
        {
            name: "GO分析",
            desc:
                "Gene Ontology 分为分子功能（molecular function）、细胞组分（cellular component）和生物过程（biological process）三大功能类。根据差异基因检测结果进行功能分类。每个大类下有各个层级的子类别。下图是所选基因集的GO注释分类结果。"
        },
        {
            name: "Pathway富集",
            desc:
                "将基因参与的KEGG代谢通路分为7个分支：细胞过程(Cellular Processes)、环境信息处理(Environmental Information Processing)、遗传信息处理(Genetic Information Processing)、人类疾病（Human Disease）（仅限动物）、代谢(Metabolism)、有机系统(Organismal Systems)、药物开发（Drug Development）。每一分支下进一步分类统计。下图是所选基因集的KEGG Pathway注释分类结果。"
        },
        {
            name: "GO分类",
            desc:
                "Gene Ontology 分为分子功能（molecular function）、细胞组分（cellular component）和生物过程（biological process）三大功能类。根据差异基因检测结果进行功能分类。每个大类下有各个层级的子类别。下图是所选基因集的GO注释分类结果。"
        },
        {
            name: "KEGG分类",
            desc:
                "将基因参与的KEGG代谢通路分为7个分支：细胞过程(Cellular Processes)、环境信息处理(Environmental Information Processing)、遗传信息处理(Genetic Information Processing)、人类疾病（Human Disease）（仅限动物）、代谢(Metabolism)、有机系统(Organismal Systems)、药物开发（Drug Development）。每一分支下进一步分类统计。下图是所选基因集的KEGG Pathway注释分类结果。"
        },
        { name: "折线图", desc: "以折线图方式呈现数据" },
        {
            name: "蛋白网络互作用",
            desc:
                "图中的每个点代表一个基因，连线表示这两个基因间有互作关系。点的大小和颜色都表示互作连接数，点越大，连接数越多。颜色由蓝色到红色渐变，越红表示连接数越多。"
        }
    ];
    desc:string = '';
    title:String = '';

    // 子模块参数
    childVisible = false;
    constructor(public toolsService: ToolsService) {}

    ngOnInit() {}

    init(){
        this.desc = '';
        this.title = '';
        this.childVisible = false;
    }

    close() {
        this.toolsService["visible"] = false;
        this.init();
    }

    handlerMouseOver(tool){
        this.title = tool['name'];
        this.desc = tool['desc'];
    }

    selectParams(){
        this.childVisible = true;
    }

    handlerChildClose(){
        this.childVisible = false;
    }
}
