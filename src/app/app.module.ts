import { BrowserModule } from '@angular/platform-browser';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
// module
import { NgModule } from '@angular/core';
// import ant ui
import { NgZorroAntdModule } from 'ng-zorro-antd';
// route state keep alive
import { SimpleReuseStrategy } from './super/service/simpleReuseStrategy';
// import component
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { IndexComponent } from './pages/mrna/index.component';
import { cxzk1Component } from './pages/mrna/cxzk1.component';
import { cxzk2Component } from './pages/mrna/cxzk2.component';
import { NotFoundComponent } from './pages/notFound.component';
import { DnaIndexComponent } from './pages/dna/index.component';
import { JyzbdComponent } from './pages/dna/jyzbd.component';
import {AddColumnComponent} from './super/components/add-column.component';

import { FrametopComponent } from './include/frametop.component';
import { LeftsideComponent } from './include/leftside.component';

// service
// import { HttpInterService } from './super/service/httpService';
import { GlobalService } from './super/service/globalService';
import { LoadingService } from './super/service/loadingService';
import { MessageService } from './super/service/messageService'
import { AjaxService } from './super/service/ajaxService';
import { StoreService} from './super/service/storeService';

// directive
import { TooltipDirective } from './super/directive/tooltip.directive';
import { GeneTableComponent } from './super/components/gene-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FilterComponent } from './super/components/filter.component';
import { ErrorComponent } from './super/components/error.component';

// international
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// config
import config from '../config';
import { SyserrorComponent } from './pages/syserror.component';

// test
import {tableComponent} from './pages/mrna/table.component';
import { AddComponent } from './pages/mrna/add.component';
import { LittleTableComponent } from './super/components/little-table.component';
import { CommonBigTableComponent } from './super/components/common-big-table.component';
import { TableSwitchChartComponent } from './super/components/table-switch-chart.component';
import { LittleTableTestComponent } from './pages/mrna/little-table-test.component';
import { AccuracyPipe } from './super/filter/accuracy.pipe';
import {ReanalysisIndexComponent} from './pages/reanalysis/index.component';
import { TransformationTableComponent } from './super/components/transformation-table.component';
import { GeneRelativeComponent } from './super/components/gene-relative.component';
const ROUTES:Routes =[
    // mrna
    {
        'path': 'report/mrna',
        'component': IndexComponent,
        'data':{
            'keep':false,
            'module':'reportMrna'
        },
        'children': [
            // demo
            {
                'path':'table',
                'component':tableComponent,
                'data':{
                    'keep':true,
                    'module':'table'
                }
            },
            {
                'path':'addColumn',
                'component':AddComponent,
                'data':{
                    'keep':true,
                    'module':'addColumn'
                }
            },
            {
                'path':'transformationTable',
                'component':TransformationTableComponent,
                'data':{
                    'keep':true,
                    'module':"transformationTable"
                }
            },
            {
                'path':'littleTableTest',
                'component':LittleTableTestComponent,
                'data':{
                    'keep':true,
                    'module':'littleTableTest'
                }
            },
            {
                'path':'commonBigTable',
                'component':CommonBigTableComponent,
                'data':{
                    'keep':true,
                    'module':'commonBigTable'
                }
            },
            {
                'path':'tableSwitchChart',
                'component':TableSwitchChartComponent,
                'data':{
                    'keep':true,
                    'module':'tableSwitchChart'
                }
            },
            // page
            {
                'path': 'cxzk1',
                'component': cxzk1Component,
                'data':{
                    'keep':true,
                    'module':"cxzk1"
                }
            },
            {
                'path': 'cxzk2',
                'component': cxzk2Component,
                'data':{
                    'keep':true,
                    'module':"cxzk2"
                }
            }
        ],
    },
    // dna
    {
        'path': 'report/dna',
        'component': DnaIndexComponent,
        'data':{
            'keep':false,
            'module':'reportDna'
        },
        'children': [
            {
                'path': 'jyzbd',
                'component': JyzbdComponent,
                'data':{
                    'keep':true,
                    'module':"jyzbd"
                }
            }
        ],
    },
    // 重分析
    {
        'path':"report/reanalysis/index",
        'component':ReanalysisIndexComponent,
        'data':{
            'keep':true,
            'module':'reanalysisIndex'
        }
    },
    // common
    {
        'path':'report/login',
        'component':LoginComponent,
        'data':{
            'keep':false,
            'module':'login'
        }
    },
    {
        'path':"reprot/sysError",
        'component':SyserrorComponent,
        'data':{
            'keep':false,
            'module':'sysError'
        }
    },
    {
        'path': 'report/404',
        'component': NotFoundComponent,
        'data':{
            'keep':false,
            'module':'404'
        }
    },
    {
        'path': '',
        'redirectTo': 'report/login',
        'pathMatch': 'full'
    },
    {
        'path': '**',
        'redirectTo': 'report/404',
        'pathMatch': 'full'
    },

]


export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '../assets/', '.json');
}

@NgModule({
    // 组件，指令，过滤器（管道） 申明在declarations 里
    declarations: [
        LoginComponent,
        IndexComponent,
        cxzk1Component,
        cxzk2Component,
        tableComponent,
        NotFoundComponent,
        AppComponent,
        FrametopComponent,
        LeftsideComponent,
        GeneTableComponent,
        FilterComponent,
        ErrorComponent,
        DnaIndexComponent,
        ReanalysisIndexComponent,
        JyzbdComponent,
        SyserrorComponent,
        AddColumnComponent,
        AddComponent,
        LittleTableComponent,
        CommonBigTableComponent,
        TableSwitchChartComponent,
        LittleTableTestComponent,
        AccuracyPipe,
        TransformationTableComponent,
        GeneRelativeComponent,
        TooltipDirective
    ],
    // 路由模块在imports 导入
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NgZorroAntdModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot(ROUTES),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        })
    ],
    exports: [
        TranslateModule
    ],
    // 服务和拦截器在providers申明
    providers: [
        LoadingService,
        GlobalService,
        MessageService,
        AjaxService,
        StoreService,
        // { provide: HTTP_INTERCEPTORS, useClass: HttpInterService, multi: true },
        // enable route alive
        { provide: RouteReuseStrategy, useClass: SimpleReuseStrategy },
        // enable hash module
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
