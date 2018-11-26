import { BrowserModule } from "@angular/platform-browser";
import { ColorPickerModule, ColorPickerDirective } from "ngx-color-picker";
import { NgxSpinnerModule } from "ngx-spinner";
import {
    HashLocationStrategy,
    LocationStrategy,
    registerLocaleData
} from "@angular/common";
import { RouterModule, Routes, RouteReuseStrategy } from "@angular/router";
import { NgModule } from "@angular/core";
import { NgZorroAntdModule, NZ_MESSAGE_CONFIG } from "ng-zorro-antd";
import { SimpleReuseStrategy } from "./super/service/simpleReuseStrategy";

// 组件
import { AppComponent } from "./app.component";
import { LoginComponent } from "./pages/login/login.component";
import { IndexComponent } from "./pages/mrna/index.component";
import { cxzk1Component } from "./pages/mrna/cxzk1.component";
import { cxzk2Component } from "./pages/mrna/cxzk2.component";
import { netComponent } from "./pages/mrna/net.component";
import { multiOmicsComponent } from "./pages/mrna/multiOmics.component";
import { clusterComponent } from "./pages/mrna/cluster.component";
import { NotFoundComponent } from "./pages/notFound.component";
import { DnaIndexComponent } from "./pages/dna/index.component";
import { JyzbdComponent } from "./pages/dna/jyzbd.component";
import { AddColumnComponent } from "./super/components/add-column.component";
import { ChartExportComponent } from "./super/components/chart-export.component";
import { GeneTableComponent } from "./super/components/gene-table.component";
import { TopComponent } from "./include/top.component";
import { MenuComponent } from "./include/menu.component";
import { FilterComponent } from "./super/components/filter.component";
import { ErrorComponent } from "./super/components/error.component";
import { SyserrorComponent } from "./pages/syserror.component";
import { GeneTableTestComponent } from "./pages/mrna/gene-table-test.component";
import { AddComponent } from "./pages/mrna/add.component";
import { LittleTableComponent } from "./super/components/little-table.component";
import { BigTableComponent } from "./super/components/big-table.component";
import { TableSwitchChartComponent } from "./super/components/table-switch-chart.component";
import { LittleTableTestComponent } from "./pages/mrna/little-table-test.component";
import { MultiOmicsSetComponent } from "./super/components/multiOmicsSet.component";
import { ClusterSetComponent } from "./super/components/clusterSet.component";
import { ReanalysisIndexComponent } from "./pages/reanalysis/index.component";
import { TransformationTableComponent } from "./super/components/transformation-table.component";
import { GeneRelativeComponent } from "./super/components/gene-relative.component";
import { BigTableTestComponent } from "./pages/mrna/big-table-test.component";
import { GeneTransformTableTestComponent } from "./pages/mrna/gene-transform-table-test.component";
import { GridExportComponent } from "./super/components/grid-export.component";
import { PaginationComponent } from "./super/components/pagination.component";
import { TreeComponent } from "./super/components/tree.component";
import { TreeItemComponent } from "./super/components/tree-item.component";
import { ColorPickerComponent } from "./super/components/color-picker.component";
import { ExpressVennComponent } from "./pages/mrna/expressVenn.component";
import { DiffVennComponent, DiffVennPage } from "./pages/mrna/diffVenn.component";
import { Layout1Component, Layout1Page } from "./pages/mrna/layout1.component";
import { Layout2Component } from "./pages/mrna/layout2.component";
import { ToolsComponent } from "./super/components/tools.component";
import { SysDefendComponent } from "./pages/sysDefend.component";

// 服务
// import { HttpInterService } from './super/service/httpService';
import { GlobalService } from "./super/service/globalService";
import { LoadingService } from "./super/service/loadingService";
import { MessageService } from "./super/service/messageService";
import { AjaxService } from "./super/service/ajaxService";
import { StoreService } from "./super/service/storeService";
import { TooltipDirective } from "./super/directive/tooltip.directive";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
    HttpClientModule,
    HttpClient,
    HTTP_INTERCEPTORS
} from "@angular/common/http";
import { SysDefendService } from "./super/service/sysDefendService";
import { PageModuleService } from "./super/service/pageModuleService";

// 国际化
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

// 管道
import { AccuracyPipe } from "./super/filter/accuracy.pipe";
import config from "../config";

const ROUTES: Routes = [
    // mrna
    {
        path: "report/mrna",
        component: IndexComponent,
        data: {
            keep: true,
            module: "mrnaIndex"
        },
        canActivateChild: [SysDefendService],
        children: [
            // demo
            {
                path: "",
                redirectTo: "layout1",
                pathMatch: "full"
            },
            {
                path: "table",
                component: GeneTableTestComponent,
                data: {
                    keep: true,
                    module: "geneTableTest"
                }
            },
            {
                path: "addColumn",
                component: AddComponent,
                data: {
                    keep: true,
                    module: "addColumn"
                }
            },
            {
                path: "transformationTable",
                component: GeneTransformTableTestComponent,
                data: {
                    keep: true,
                    module: "geneTransformationTable"
                }
            },
            {
                path: "littleTableTest",
                component: LittleTableTestComponent,
                data: {
                    keep: true,
                    module: "littleTableTest"
                }
            },
            {
                path: "bigTable",
                component: BigTableTestComponent,
                data: {
                    keep: true,
                    module: "bigTable"
                }
            },
            // page
            {
                path: "cxzk1",
                component: cxzk1Component,
                data: {
                    keep: true,
                    module: "cxzk1"
                }
            },
            {
                path: "cxzk1",
                component: cxzk2Component,
                data: {
                    keep: true,
                    module: "cxzk2"
                }
            },
            {
                path: "net",
                component: netComponent,
                data: {
                    keep: true,
                    module: "net"
                }
            },
            {
                path: "multiOmics",
                component: multiOmicsComponent,
                data: {
                    keep: true,
                    module: "multiOmics"
                }
            },
            {
                path: "express-venn",
                component: ExpressVennComponent,
                data: {
                    keep: true,
                    module: "expressVenn"
                }
            },
            {
                path: "diff-venn",
                component: DiffVennPage,
                data: {
                    keep: true,
                    module: "diffVenn"
                }
            },
            {
                path: "layout1",
                component: Layout1Page,
                data: {
                    keep: true,
                    module: "layout1"
                }
            },
            {
                path: "layout2",
                component: Layout2Component,
                data: {
                    keep: true,
                    module: "layout2"
                }
            },
            {
                path: "cluster",
                component: clusterComponent,
                data: {
                    keep: true,
                    module: "cluster"
                }
            }
        ]
    },
    // dna
    {
        path: "report/dna",
        component: DnaIndexComponent,
        data: {
            keep: false,
            module: "reportDna"
        },
        canActivateChild: [SysDefendService],
        children: [
            {
                path: "jyzbd",
                component: JyzbdComponent,
                data: {
                    keep: true,
                    module: "jyzbd"
                }
            }
        ]
    },
    // 重分析
    {
        path: "report/reanalysis/index",
        component: ReanalysisIndexComponent,
        canActivate: [SysDefendService],
        data: {
            keep: true,
            module: "reanalysisIndex"
        }
    },
    // common
    {
        path: "report/login",
        component: LoginComponent,
        canActivate: [SysDefendService],
        data: {
            keep: false,
            module: "login"
        }
    },
    {
        path: "reprot/sysError",
        component: SyserrorComponent,
        canActivate: [SysDefendService],
        data: {
            keep: false,
            module: "sysError"
        }
    },
    {
        path: "report/404",
        component: NotFoundComponent,
        canActivate: [SysDefendService],
        data: {
            keep: false,
            module: "404"
        }
    },
    {
        path: "report/sysDefend",
        component: SysDefendComponent,
        data: {
            keep: false,
            module: "sysDefend"
        }
    },
    {
        path: "",
        redirectTo: "report/login",
        canActivate: [SysDefendService],
        pathMatch: "full"
    },
    {
        path: "**",
        redirectTo: "report/404",
        canActivate: [SysDefendService],
        pathMatch: "full"
    }
];

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "../assets/lang/", ".json");
}

@NgModule({
    // 组件，指令，过滤器（管道） 申明在declarations 里
    declarations: [
        DiffVennPage,
        Layout1Page,
        SysDefendComponent,
        LoginComponent,
        IndexComponent,
        cxzk1Component,
        cxzk2Component,
        netComponent,
        multiOmicsComponent,
        clusterComponent,
        GeneTableTestComponent,
        GeneTableComponent,
        NotFoundComponent,
        AppComponent,
        TopComponent,
        MenuComponent,
        FilterComponent,
        ErrorComponent,
        DnaIndexComponent,
        ReanalysisIndexComponent,
        JyzbdComponent,
        SyserrorComponent,
        AddColumnComponent,
        ChartExportComponent,
        AddComponent,
        LittleTableComponent,
        BigTableComponent,
        TableSwitchChartComponent,
        LittleTableTestComponent,
        MultiOmicsSetComponent,
        ClusterSetComponent,
        AccuracyPipe,
        TransformationTableComponent,
        GeneRelativeComponent,
        BigTableTestComponent,
        GeneTransformTableTestComponent,
        GridExportComponent,
        PaginationComponent,
        TreeItemComponent,
        ExpressVennComponent,
        DiffVennComponent,
        Layout1Component,
        Layout2Component,
        TreeComponent,
        ToolsComponent,
        ColorPickerComponent,
        TooltipDirective
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
                deps: [HttpClient]
            }
        })
    ],
    exports: [TranslateModule],
    // 服务和拦截器在providers申明
    providers: [
        LoadingService,
        GlobalService,
        MessageService,
        AjaxService,
        StoreService,
        SysDefendService,
        PageModuleService,
        // , { nzDuration: 1000,nzPauseOnHover:true,nzMaxStack:3 }
        {
            provide: NZ_MESSAGE_CONFIG,
            useValue: {
                nzDuration: 1000,
                nzPauseOnHover: true,
                nzMaxStack: 3,
                nzAnimate: true
            }
        },
        // { provide: HTTP_INTERCEPTORS, useClass: HttpInterService, multi: true },
        // enable route alive
        { provide: RouteReuseStrategy, useClass: SimpleReuseStrategy },
        // enable hash module
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
