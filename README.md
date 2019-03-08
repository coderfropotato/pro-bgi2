# Report-web-bgi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.5.

## Run
`npm i`
`npm start`

## Angular-cli argv intorduce

```bash
ng g component xxx --flat --spec=false --inline-style
```

```javascript
ng g cl my-new-class: 新建 class
ng g c my-new-component: 新建组件
ng g d my-new-directive: 新建指令
ng g e my-new-enum: 新建枚举
ng g m my-new-module: 新建模块
ng g p my-new-pipe: 新建管道
ng g s my-new-service: 新建服务    
```

```javascript
--flat: boolean, 默认为 false, 表示在 src/app 目录下生成组件而不是在 src/app/site-header 目录中
--inline-template: boolean, 默认为 false, 表示使用内联模板而不是使用独立的模板文件
--inline-style: boolean, 默认为 false, 表示使用内联样式而不是使用独立的样式文件
--prefix: boolean, 默认为 true, 使用 .angular-cli.json 配置的前缀作为组件选择器的前缀
--spec: boolean, 默认为 true, 表示生成包含单元测试的 spec 文件
--view-encapsulation: string, 用于设置组件的视图封装策略
--change-detection: string, 用于设置组件的变化检测策略
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

