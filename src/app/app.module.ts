import { BrowserModule } from '@angular/platform-browser';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
// module
import { NgModule } from '@angular/core';
// import ant ui
import { NgZorroAntdModule } from 'ng-zorro-antd';
// route state keep alive
import { SimpleReuseStrategy } from './super/service/simpleReuseStrategy';

import { AppComponent } from './app.component';
import { IndexComponent } from './pages/index.component';
import { cxzk1Component } from './pages/cxzk1.component';
import { cxzk2Component } from './pages/cxzk2.component';
import { NotFoundComponent } from './pages/not-found.component';
import { MyNewPipePipe } from './super/filter/my-new-pipe.pipe';
import { KeysPipe } from './super/filter/keys.pipe';
import { HtmlFilter } from './super/filter/html.pipe';

import { FrametopComponent } from './include/frametop.component';
import { LeftsideComponent } from './include/leftside.component';

// service
import { HttpInterService } from './super/service/httpService';
import { GlobalService } from './super/service/globalService';
import { LoadingService } from './super/service/loadingService';

// directive
import { TooltipDirective } from './super/directive/tooltip.directive';
import { BigTableComponent } from './super/components/big-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FilterComponent } from './super/components/filter.component';
import { ErrorComponent } from './super/components/error.component';

// international
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


const ROUTES: Routes = [
    {
        'path': 'report',
        'component': IndexComponent,
        'children': [
            {
                'path': 'cxzk1',
                'component': cxzk1Component,
            },
            {
                'path': 'cxzk2',
                'component': cxzk2Component
            }
        ],
    },
    {
        'path': '',
        'redirectTo': '/report',
        'pathMatch': 'full'
    },
    {
        'path': '404',
        'component': NotFoundComponent
    }
];


export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '../assets/', '.json');
}

@NgModule({
    // 组件，指令，过滤器（管道） 申明在declarations 里
    declarations: [
        IndexComponent,
        cxzk1Component,
        cxzk2Component,
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
        TooltipDirective
    ],
    // 路由模块在imports 导入
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot(ROUTES),
        NgZorroAntdModule,
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
        { provide: HTTP_INTERCEPTORS, useClass: HttpInterService, multi: true },
        // enable route alive
        { provide: RouteReuseStrategy, useClass: SimpleReuseStrategy },
        // enable hash module
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
