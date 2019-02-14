import { BrowserModule } from '@angular/platform-browser';
import { ColorPickerModule, ColorPickerDirective } from 'ngx-color-picker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { NgModule } from '@angular/core';
import { NgZorroAntdModule, NZ_MESSAGE_CONFIG, NZ_NOTIFICATION_CONFIG } from 'ng-zorro-antd';
import { SimpleReuseStrategy } from './super/service/simpleReuseStrategy';

// 组件
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { IndexComponent } from './pages/mrna/index.component';
import { NotFoundComponent } from './pages/notFound.component';
import { DnaIndexComponent } from './pages/dna/index.component';
import { AddColumnComponent } from './super/components/add-column.component';
import { ChartExportComponent } from './super/components/chart-export.component';
import { GeneTableComponent } from './super/components/gene-table.component';
import { TopComponent } from './include/top.component';
import { MenuComponent } from './include/menu.component';
import { FilterComponent } from './super/components/filter.component';
import { ErrorComponent } from './super/components/error.component';
import { SyserrorComponent } from './pages/syserror.component';
import { LittleTableComponent } from './super/components/little-table.component';
import { BigTableComponent } from './super/components/big-table.component';
import { TableSwitchChartComponent } from './super/components/table-switch-chart.component';
import { MultiOmicsSetComponent } from './super/components/multiOmicsSet.component';
import { ClusterSetComponent } from './super/components/clusterSet.component';
import { NetSetComponent } from './super/components/netSet.component';
import { TransformationTableComponent } from './super/components/transformation-table.component';
import { GeneRelativeComponent } from './super/components/gene-relative.component';
import { GridExportComponent } from './super/components/grid-export.component';
import { PaginationComponent } from './super/components/pagination.component';
import { TreeComponent } from './super/components/tree.component';
import { TreeItemComponent } from './super/components/tree-item.component';
import { ColorPickerComponent } from './super/components/color-picker.component';
import { ToolsComponent } from './super/components/tools.component';
import { SysDefendComponent } from './pages/sysDefend.component';
import { LayoutSwitchComponent } from './super/components/layout-switch.component';
import { LoadingComponent } from './pages/reanalysis/loading.component';
import { BigTableCheckComponent } from './super/components/big-table-check.component';

// 页面
/* 基础模块 */
import { OverviewComponent } from './pages/mrna/base/overview.component';
import { InformationComponent } from './pages/mrna/base/information.component';
import { ReadsFilterComponent } from './pages/mrna/base/reads-filter.component';
import { ReadsComparisonComponent } from './pages/mrna/base/reads-comparison.component';
import { LrnaComponent } from './pages/mrna/base/lrna.component';
import { BasicHelpComponent } from './pages/mrna/base/help.component';
/* 差异表达 */
import { DiffExpressionComponent, DiffVennPage } from './pages/mrna/diff-expression.component';
import { DiffExpressionHelpComponent } from './pages/mrna/diff-expression-help.component';
/* 表达量 */
import { ExpressVennComponent, ExpressVennPage } from './pages/mrna/expressVenn.component';
import { ExpressionHelpComponent } from './pages/mrna/expression-help.component';
/* 差异聚类 */
import { ClusterComponent } from './pages/mrna/cluster.component';
import { ClusterHelpComponent } from './pages/mrna/cluster-help.component';
/* GO */
import { GoClassComponent,GoClassPage } from './pages/mrna/go-class.component';
import { GoRichComponent } from './pages/mrna/go-rich.component';
import { GoHelpComponent } from './pages/mrna/go-help.component';
/* KEGG */
import { KeggClassComponent } from './pages/mrna/kegg-class.component';
import { KeggRichComponent } from './pages/mrna/kegg-rich.component';
import { KeggHelpComponent } from './pages/mrna/kegg-help.component';
/* 结构变异 */
import { SnpComponent } from './pages/mrna/snp.component';
import { IndelComponent } from './pages/mrna/indel.component';
import { AlternativeSplicingComponent } from './pages/mrna/alternative-splicing.component';
import { GeneFusionComponent } from './pages/mrna/gene-fusion.component';
import { StructureVariationHelpComponent } from './pages/mrna/structure-variation-help.component';
/* 基因总表 */
import { GeneComponent } from './pages/mrna/gene.component';
/* 上传模块 */
import { UploadComponent } from './pages/mrna/upload.component';

/* 小工具 */
import { ReanalysisIndexComponent } from './pages/reanalysis/index.component';
import { ReListComponent } from './pages/reanalysis/re-list.component';
import { ReMultiOmicsComponent } from './pages/reanalysis/re-multiOmics.component';
import { ReHeatmapComponent } from './pages/reanalysis/re-heatmap.component';
import { reRelationHeatmapComponent } from './pages/reanalysis/re-relationHeatmap.component';
import { reRelationNetComponent } from './pages/reanalysis/re-relationNet.component';
import { ReNetComponent } from './pages/reanalysis/re-net.component';
import { ReKdaComponent } from './pages/reanalysis/re-kda.component';
import { ReLineComponent } from './pages/reanalysis/re-line.component';
import { KaFunComponent } from './pages/reanalysis/re-kaFun.component';
import { RelativeSpliceComponent } from './pages/reanalysis/re-relativeSplice.component';
import { GeneListIndexComponent } from './pages/geneList/index.component';
import { ReClassComponent } from './pages/reanalysis/re-class.component';
import { ReRichComponent } from './pages/reanalysis/re-rich.component';

/* 基因集 */
import { GeneListVennComponent, GeneListVennPageComponent } from './pages/geneList/venn.component';

// 服务
import { GlobalService } from './super/service/globalService';
import { LoadingService } from './super/service/loadingService';
import { MessageService } from './super/service/messageService';
import { AjaxService } from './super/service/ajaxService';
import { StoreService } from './super/service/storeService';
import { TooltipDirective } from './super/directive/tooltip.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SysDefendService } from './super/service/sysDefendService';
import { PageModuleService } from './super/service/pageModuleService';
import { AddColumnService } from './super/service/addColumnService';
import { PromptService } from './super/service/promptService';
import { PromtComponent } from './super/service/promptService';

// 国际化
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// 管道
import { AccuracyPipe } from './super/filter/accuracy.pipe';
import { TableSpecialTheadFilter } from './super/filter/tableSpecialThead.pipe';
import config from '../config';


/**
 * 基础模块
 * 项目概况	overview
 * 参考信息	reference
 * reads过滤	reads-filter
 * reads检测	reads-alignment
 * 小RNA检测	smallrna
 * 帮助	basic-help
 *
 * 差异表达
 * 差异表达	diff-expression
 * 帮助	diff-expression-help
 *
 * 表达量
 * 表达量	expression
 * 帮助	expression-help
 *
 * 差异聚类	cluster
 * 帮助	cluster-help
 *
 * GO
 * GO分类 go-class
 * GO富集	go-enrichment
 * 帮助	go-help
 *
 * KEGG
 * KEGG分类	kegg-class
 * KEGG富集	kegg-enrichment
 * 帮助	kegg-help
 *
 * 结构变异
 * SNP	snp
 * INDEL	indel
 * 可变剪切	alternative-splicing
 * 基因融合	gene-fusion
 * 帮助	structure-variation-help
 *
 * 基因总表
 * 基因总表	gene
 */
const ROUTES: Routes = [
	// mrna
	{
		path: 'report/mrna',
		component: IndexComponent,
		data: {
			keep: true,
			module: 'mrnaIndex'
		},
		canActivateChild: [ SysDefendService ],
		children: [
			// {
			// 	path: '',
			// 	redirectTo: 'diff-expression',
			// 	pathMatch: 'full'
			// },
			// 基础模块
			{
				path: 'overview',
				component: OverviewComponent,
				data: {
					keep: false,
					module: 'overview'
				}
			},
			{
				path: 'reference',
				component: InformationComponent,
				data: {
					keep: false,
					module: 'reference'
				}
			},
			{
				path: 'reads-filter',
				component: ReadsFilterComponent,
				data: {
					keep: false,
					module: 'readsFilter'
				}
			},
			{
				path: 'reads-alignment',
				component: ReadsComparisonComponent,
				data: {
					keep: false,
					module: 'readsAlignment'
				}
			},
			{
				path: 'smallrna',
				component: LrnaComponent,
				data: {
					keep: false,
					module: 'smallRNA'
				}
			},
			{
				path: 'basic-help',
				component: BasicHelpComponent,
				data: {
					keep: true,
					module: 'basicHelp'
				}
			},
			// 差异表达
			{
				path: 'diff-expression',
				component: DiffVennPage,
				data: {
					keep: true,
					module: 'diffExpression'
				}
			},
			{
				path: 'diff-expression-help',
				component: DiffExpressionHelpComponent,
				data: {
					keep: true,
					module: 'diffExpressionHelp'
				}
			},
			// 表达量
			{
				path: 'expression',
				component: ExpressVennPage,
				data: {
					keep: true,
					module: 'expression'
				}
			},
			{
				path: 'expression-help',
				component: ExpressionHelpComponent,
				data: {
					keep: true,
					module: 'expressionHelp'
				}
			},
			// 差异聚类
			{
				path: 'cluster',
				component: ClusterComponent,
				data: {
					keep: true,
					module: 'cluster'
				}
			},
			{
				path: 'cluster-help',
				component: ClusterHelpComponent,
				data: {
					keep: true,
					module: 'clusterHelp'
				}
			},
			// GO
			{
				path:'go-class',
				component:GoClassComponent,
				data:{keep:true,module:'goClass'}
			},
			{
				path:'go-enrichment',
				component:GoRichComponent,
				data:{keep:true,module:'goEnrichment'}
			},
			{
				path:'go-help',
				component:GoHelpComponent,
				data:{keep:true,module:'goHelp'}
			},
			// KEGG
			{
				path:'kegg-class',
				component:KeggClassComponent,
				data:{keep:true,module:'keggClass'}
			},
			{
				path:'kegg-enrichment',
				component:KeggRichComponent,
				data:{keep:true,module:'keggEnrichment'}
			},
			{
				path:'kegg-help',
				component:KeggHelpComponent,
				data:{keep:true,module:'keggHelp'}
			},
			// 结构变异
			{
				path:'snp',
				component:SnpComponent,
				data:{keep:true,module:'SNP'}
			},
			{
				path:'indel',
				component:IndelComponent,
				data:{keep:true,module:'INDEL'}
			},
			{
				path:'alternative-splicing',
				component:AlternativeSplicingComponent,
				data:{keep:true,module:'alternativeSplicing'}
			},
			{
				path:'gene-fusion',
				component:GeneFusionComponent,
				data:{keep:true,module:'geneFusion'}
			},
			{
				path:'structure-variation-help',
				component:StructureVariationHelpComponent,
				data:{keep:true,module:'structureVariationHelp'}
			},
			// 基因总表
			{
				path:'gene',
				component:GeneComponent,
				data:{keep:true,module:'gene'}
			},
			{
				path: 'upload', // 上传数据
				component: UploadComponent,
				data: {
					keep: false,
					module: 'upload'
				}
			}
		]
	},
	// 基因集
	{
		path: 'report/gene-list',
		component: GeneListIndexComponent,
		data: {
			keep: true,
			module: 'geneList'
		},
		canActivateChild: [ SysDefendService ],
		children: [
			{
				path: 'venn',
				component: GeneListVennPageComponent,
				data: {
					keep: true,
					module: 'GeneListVennPage'
				}
			},
			{
				path: '',
				redirectTo: 'venn',
				pathMatch: 'full'
			},
			{
				path: '**',
				redirectTo: 'venn',
				pathMatch: 'full'
			}
		]
	},

	// 重分析
	{
		path: 'report/reanalysis',
		component: ReanalysisIndexComponent,
		canActivateChild: [ SysDefendService ],
		data: {
			keep: false,
			module: 'reanalysisIndex'
		},
		children: [
			{
				path: 'index',
				component: ReListComponent,
				data: {
					keep: false,
					module: 'reList'
				}
			},

			{
				path: 're-multiOmics/:geneType/:tid/:version',
				component: ReMultiOmicsComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reMutiOmics'
				}
			},
			{
				path: 're-heatmap/:geneType/:tid/:version',
				component: ReHeatmapComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reHeatmap'
				}
			},
			{
				path: 're-heatmaprelation/:geneType/:tid/:version',
				component: reRelationHeatmapComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reRelationHeatmap'
				}
			},
			{
				path: 're-net/:geneType/:tid/:version',
				component: ReNetComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reNet'
				}
			},
			{
				path: 're-linkedNetwork/:geneType/:tid/:version',
				component: reRelationNetComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reRelationNet'
				}
			},
			{
				path: 're-kda/:geneType/:tid/:version',
				component: ReKdaComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reKda'
				}
			},
			{
				path: 're-line/:geneType/:tid/:version',
				component: ReLineComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reLine'
				}
			},
			{
				path: 're-chiSquare/:geneType/:tid/:version',
				component: KaFunComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reKaFun'
				}
			},
			{
				path: 're-as/:geneType/:tid/:version',
				component: RelativeSpliceComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reRelativeSplice'
				}
			},
			{
				path: 're-classification/:geneType/:tid/:version/:annotation',
				component: ReClassComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reClass'
				}
			},
			{
				path: 're-enrichment/:geneType/:tid/:version/:annotation',
				component: ReRichComponent,
				canActivate: [ SysDefendService ],
				data: {
					keep: false,
					module: 'reRich'
				}
			},
			{
				path: '',
				redirectTo: 'index',
				pathMatch: 'full'
			}
		]
	},
	{
		path: 'report/reanalysis/loading',
		component: LoadingComponent,
		data: {
			keep: false,
			module: 'reLoading'
		}
	},
	// common
	{
		path: 'report/login',
		component: LoginComponent,
		canActivate: [ SysDefendService ],
		data: {
			keep: false,
			module: 'login'
		}
	},
	{
		path: 'reprot/sysError',
		component: SyserrorComponent,
		canActivate: [ SysDefendService ],
		data: {
			keep: false,
			module: 'sysError'
		}
	},
	{
		path: 'report/404',
		component: NotFoundComponent,
		canActivate: [ SysDefendService ],
		data: {
			keep: false,
			module: '404'
		}
	},
	{
		path: 'report/sysDefend',
		component: SysDefendComponent,
		data: {
			keep: false,
			module: 'sysDefend'
		}
	},
	// dna
	// {
	// 	path: 'report/dna',
	// 	component: DnaIndexComponent,
	// 	data: {
	// 		keep: false,
	// 		module: 'reportDna'
	// 	},
	// 	canActivateChild: [ SysDefendService ],
	// 	children: []
	// },
	{
		path: '',
		redirectTo: 'report/login',
		canActivate: [ SysDefendService ],
		pathMatch: 'full'
	},
	{
		path: '**',
		redirectTo: 'report/404',
		canActivate: [ SysDefendService ],
		pathMatch: 'full'
	}
];

export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, '../assets/lang/', '.json');
}

@NgModule({
	// 组件，指令，过滤器（管道） 申明在declarations 里
	declarations: [
		DiffVennPage,
		ExpressVennPage,
		GeneListIndexComponent,
		SysDefendComponent,
		LoginComponent,
		IndexComponent,
		GoRichComponent,
		ClusterComponent,
		GeneTableComponent,
		NotFoundComponent,
		AppComponent,
		TopComponent,
		MenuComponent,
		FilterComponent,
		ErrorComponent,
		DnaIndexComponent,
		ReanalysisIndexComponent,
		SyserrorComponent,
		AddColumnComponent,
		ChartExportComponent,
		LittleTableComponent,
		BigTableComponent,
		TableSwitchChartComponent,
		MultiOmicsSetComponent,
		ClusterSetComponent,
		NetSetComponent,
		AccuracyPipe,
		TransformationTableComponent,
		GeneRelativeComponent,
		GridExportComponent,
		PaginationComponent,
		TreeItemComponent,
		ExpressVennComponent,
		DiffExpressionComponent,
		TreeComponent,
		ToolsComponent,
		UploadComponent,
		ColorPickerComponent,
		ReListComponent,
		ReHeatmapComponent,
		reRelationHeatmapComponent,
		TooltipDirective,
		ReNetComponent,
		ReKdaComponent,
		reRelationNetComponent,
		ReLineComponent,
		KaFunComponent,
		RelativeSpliceComponent,
		LayoutSwitchComponent,
		ReMultiOmicsComponent,
		LoadingComponent,
		ExpressionHelpComponent,
        ClusterHelpComponent,
        GoClassPage,
		GoClassComponent,
		GoHelpComponent,
		KeggClassComponent,
		KeggRichComponent,
		KeggHelpComponent,
		SnpComponent,
		IndelComponent,
		AlternativeSplicingComponent,
		GeneFusionComponent,
		StructureVariationHelpComponent,
		GeneComponent,
		GeneListVennComponent,
		DiffExpressionHelpComponent,
		GeneListVennPageComponent,
		BigTableCheckComponent,
		ReClassComponent,
		ReRichComponent,
		PromtComponent,
		OverviewComponent,
		InformationComponent,
		ReadsComparisonComponent,
		LrnaComponent,
		ReadsFilterComponent,
		BasicHelpComponent,
		TableSpecialTheadFilter
	],
	// 路由模块在imports 导入
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		NgxSpinnerModule,
		ColorPickerModule,
		NgZorroAntdModule,
		ReactiveFormsModule,
		FormsModule,
		HttpClientModule,
		RouterModule.forRoot(ROUTES),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [ HttpClient ]
			}
		})
	],
	exports: [ TranslateModule ],
	// 服务和拦截器在providers申明
	providers: [
		LoadingService,
		GlobalService,
		MessageService,
		AjaxService,
		StoreService,
		SysDefendService,
		PageModuleService,
		AddColumnService,
		PromptService,
		// , { nzDuration: 1000,nzPauseOnHover:true,nzMaxStack:3 }
		{
			provide: NZ_MESSAGE_CONFIG,
			useValue: { nzDuration: 3000, nzPauseOnHover: true, nzMaxStack: 3, nzAnimate: true }
		},
		{
			provide: NZ_NOTIFICATION_CONFIG,
			useValue: {
				nzTop: '40px',
				nzBottom: '24px',
				nzPlacement: 'topRight',
				nzDuration: 3000,
				nzMaxStack: 3,
				nzPauseOnHover: true,
				nzAnimate: true
			}
		},
		// enable route alive
		{ provide: RouteReuseStrategy, useClass: SimpleReuseStrategy },
		// enable hash module
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	entryComponents: [ PromtComponent ],
	bootstrap: [ AppComponent ]
})
export class AppModule {}
