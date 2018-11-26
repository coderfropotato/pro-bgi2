import { AjaxService } from './../service/ajaxService';
import { ToolsService } from './../service/toolsService';
import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import config from '../../../config';
declare const $: any;
@Component({
	selector: 'app-tools',
	templateUrl: './tools.component.html',
	styles: []
})
export class ToolsComponent implements OnInit {
	// heatmap goRich keggRich goClass keggClass line net
	toolList: object[] = [
		{ type: 'heatmap', name: '聚类重分析', desc: '横轴表示取log2后的差异倍数，即log2FoldChange。纵轴表示基因，默认配色下，色块的颜色越红表达量越高，颜色越蓝，表达量越低。' },
		{ type: 'goRich', name: 'GO富集分析', desc: 'Gene Ontology 分为分子功能（molecular function）、细胞组分（cellular component）和生物过程（biological process）三大功能类。根据差异基因检测结果进行功能分类。每个大类下有各个层级的子类别。下图是所选基因集的GO注释分类结果。' },
		{ type: 'keggRich', name: 'kegg富集', desc: '将基因参与的KEGG代谢通路分为7个分支：细胞过程(Cellular Processes)、环境信息处理(Environmental Information Processing)、遗传信息处理(Genetic Information Processing)、人类疾病（Human Disease）（仅限动物）、代谢(Metabolism)、有机系统(Organismal Systems)、药物开发（Drug Development）。每一分支下进一步分类统计。下图是所选基因集的KEGG Pathway注释分类结果。' },
		{ type: 'goClass', name: 'GO分类', desc: 'Gene Ontology 分为分子功能（molecular function）、细胞组分（cellular component）和生物过程（biological process）三大功能类。根据差异基因检测结果进行功能分类。每个大类下有各个层级的子类别。下图是所选基因集的GO注释分类结果。' },
		{ type: 'keggClass', name: 'KEGG分类', desc: '将基因参与的KEGG代谢通路分为7个分支：细胞过程(Cellular Processes)、环境信息处理(Environmental Information Processing)、遗传信息处理(Genetic Information Processing)、人类疾病（Human Disease）（仅限动物）、代谢(Metabolism)、有机系统(Organismal Systems)、药物开发（Drug Development）。每一分支下进一步分类统计。下图是所选基因集的KEGG Pathway注释分类结果。' },
		{ type: 'line', name: '折线图', desc: '以折线图方式呈现数据' },
		{ type: 'net', name: '蛋白网络互作用', desc: '图中的每个点代表一个基因，连线表示这两个基因间有互作关系。点的大小和颜色都表示互作连接数，点越大，连接数越多。颜色由蓝色到红色渐变，越红表示连接数越多。' },
        {type:"KDA",name:"KDA",desc:"kda"},
        {type:"multipleGroup",name:"多组学关联",desc:"多组学"},
        {type:"kaFun",name:"卡方检测",desc:"卡方"},
        {type:"relativeSplice",name:"可变剪切",desc:"可变剪切"},
        {type:"relaticeNet",name:"关联网络图",desc:"关联网络图"},
        {type:"relativeHeatmap",name:"关联聚类热图",desc:"关联聚类热图"}
	];
	desc: string = '';
	title: String = '';

    // 聚类参数
	expressData: any[] = [];
	expressUpload: any = [];
    expressSelect: any[] = [];
    expressError:boolean  = false;

	diffData: any[] = [];
	diffUpload: any = [];
    diffSelect: any[] = [];
    diffError:boolean = false;

	customData: any[] = [];
	customUpload: any[] = [];
    customSelect: any[] = [];
    customError:boolean= false;

	geneType: any[] = [];
    selectGeneType: any;

	// 当前选择的重分析类型
	selectType: string = '';
    childVisible:boolean = false;
	// 子模块参数
    constructor(
        public toolsService: ToolsService,
        private ajaxService: AjaxService
        ) {}

	ngOnInit() {}

	init() {
		this.desc = '';
		this.title = '';
	}

	close() {
		this.toolsService['visible'] = false;
		this.init();
	}

	handlerMouseOver(tool) {
		this.title = tool['name'];
		this.desc = tool['desc'];
	}

	selectParams(type) {
		this['get' + type + 'Params']();
        this.selectType = type;
        this.childVisible = true;
    }

    // 表达量数据选择
	handlerExpressSelect(data) {
		// 选中变为不选中
		if (data['checked']) {
			data['checked'] = false;
			let index = this.findIndex(data['name'], this.expressSelect, 'name');
			if (index != -1) this.expressSelect.splice(index, 1);
		} else {
			// 不选中变为选中
			// 最多选择20个
			if (this.expressSelect.length > 20) return;
			data['checked'] = true;
			this.expressSelect.push(data);
        }
        this.expressError = !this.expressSelect.length;
    }


	// 基因分类选择
	handlerGeneSelect(geneType) {
		this.geneType.forEach((v) => (v['checked'] = false));
		geneType['checked'] = true;
		this.selectGeneType = [ geneType ];
	}

	findIndex(x, arr, key) {
		return arr.findIndex((val, index) => {
			return x === val[key];
		});
    }

    getheatmapParams() {
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/reAnalysis/getHeatmap`,
				data: {
					LCID: sessionStorage.getItem('LCID')
				}
			})
			.subscribe(
				(data) => {
					if (data['status'] == '0') {
						let res = data['data'];
						this.expressData = [
							...res['expression']['group'],
							...res['expression']['sample']
						].map((val) => {
							return { name: val, checked: false };
                        });
                        if(this.expressData.length) this.expressData[0]['checked'] = true;
                        this.expressSelect.push(this.expressData[0]);

						this.diffData = res['diff']['diff_plan'].map((val) => {
							return { name: val, checked: false };
                        });
                        if(this.diffData.length) this.diffData[0]['checked'] = true;
                        this.diffSelect.push(this.diffData[0]);

						this.geneType = res['horizontalType'].map((val) => {
							return { name: val, checked: false };
                        });
                        // TODO custom data
					}
				},
				(err) => console.log(err)
			);
    }

	// go富集
	getgoRichParams() {
		console.log('gorich');
	}
	// kegg富集
	getkeggRichParams() {
		console.log('keggrich');
	}
	// go分类
	getgoClassParams() {
		console.log('goclass');
	}

	// kegg分类
	getkeggClassParams() {
		console.log('keggclass');
	}

	// 折线图
	getlineParams() {
		console.log('line');
	}

	// 网路图
	getnetParams() {
		console.log('net');
    }

    handlerChildClose(){
        this.selectType = '';
        this.childVisible = false;
    }

}
