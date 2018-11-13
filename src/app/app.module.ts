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

import { TopComponent } from "./include/top.component";
import { MenuComponent } from "./include/menu.component";

// service
// import { HttpInterService } from './super/service/httpService';
import { GlobalService } from "./super/service/globalService";
import { LoadingService } from "./super/service/loadingService";
import { MessageService } from "./super/service/messageService";
import { AjaxService } from "./super/service/ajaxService";
import { StoreService } from "./super/service/storeService";

// directive
import { TooltipDirective } from "./super/directive/tooltip.directive";
import { GeneTableComponent } from "./super/components/gene-table.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
    HttpClientModule,
    HttpClient,
    HTTP_INTERCEPTORS
} from "@angular/common/http";
import { FilterComponent } from "./super/components/filter.component";
import { ErrorComponent } from "./super/components/error.component";

// international
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

// config
import config from "../config";
import { SyserrorComponent } from "./pages/syserror.component";

import { GeneTableTestComponent } from "./pages/mrna/gene-table-test.component";
import { AddComponent } from "./pages/mrna/add.component";
import { LittleTableComponent } from "./super/components/little-table.component";
import { BigTableComponent } from "./super/components/big-table.component";
import { TableSwitchChartComponent } from "./super/components/table-switch-chart.component";
import { LittleTableTestComponent } from "./pages/mrna/little-table-test.component";
import { MultiOmicsSetComponent } from './super/components/multiOmicsSet.component';
import { AccuracyPipe } from "./super/filter/accuracy.pipe";
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
import { DiffComponent } from "./pages/mrna/diff.component";
import { VennComponent } from "./pages/mrna/venn.component";
import { Layout1Component } from './pages/mrna/layout1.component';
import { Layout2Component } from './pages/mrna/layout2.component';
const ROUTES: Routes = [
    // mrna
    {
        path: "report/mrna",
        component: IndexComponent,
        data: {
            keep: true,
            module: "mrnaIndex"
        },
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
            {
                path: "tableSwitchChart",
                component: TableSwitchChartComponent,
                data: {
                    keep: true,
                    module: "tableSwitchChart"
                }
            },
            {
                path: "MultiOmicsSet",
                component: MultiOmicsSetComponent,
                data: {
                    keep: true,
                    module: "MultiOmicsSet"
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
                path: "cxzk2",
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
                path: "diff",
                component: DiffComponent,
                data: {
                    keep: true,
                    module: "diff"
                }
            },
            {
                path: "venn",
                component: VennComponent,
                data: {
                    keep: true,
                    module: "venn"
                }
            },
            {
                path: "layout1",
                component: Layout1Component,
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
            // ,
            // {
            //     path: "**",
            //     redirectTo: "diff",
            //     pathMatch: "full"
            // }
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
        data: {
            keep: true,
            module: "reanalysisIndex"
        }
    },
    // common
    {
        path: "report/login",
        component: LoginComponent,
        data: {
            keep: false,
            module: "login"
        }
    },
    {
        path: "reprot/sysError",
        component: SyserrorComponent,
        data: {
            keep: false,
            module: "sysError"
        }
    },
    {
        path: "report/404",
        component: NotFoundComponent,
        data: {
            keep: false,
            module: "404"
        }
    },
    {
        path: "",
        redirectTo: "report/login",
        pathMatch: "full"
    }
    // },
    // {
    //     path: "**",
    //     redirectTo: "report/404",
    //     pathMatch: "full"
    // }
];

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "../assets/lang/", ".json");
}

@NgModule({
    // 组件，指令，过滤器（管道） 申明在declarations 里
    declarations: [
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
        AccuracyPipe,
        TransformationTableComponent,
        GeneRelativeComponent,
        BigTableTestComponent,
        GeneTransformTableTestComponent,
        GridExportComponent,
        PaginationComponent,
        TreeItemComponent,
        DiffComponent,
        VennComponent,
        Layout1Component,
        Layout2Component,
        TreeComponent,
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
    bootstrap: [AppComponent]
})
export class AppModule {}
