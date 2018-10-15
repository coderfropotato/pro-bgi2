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

// import pipe
import { MyNewPipePipe } from './super/filter/my-new-pipe.pipe';
import { KeysPipe } from './super/filter/keys.pipe';
import { HtmlFilter } from './super/filter/html.pipe';

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
import { BigTableComponent } from './super/components/big-table.component';
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
            'module':'login'
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
        MyNewPipePipe,
        KeysPipe,
        HtmlFilter,
        FrametopComponent,
        LeftsideComponent,
        BigTableComponent,
        FilterComponent,
        ErrorComponent,
        DnaIndexComponent,
        JyzbdComponent,
        SyserrorComponent,
        AddColumnComponent,
        AddComponent,
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
