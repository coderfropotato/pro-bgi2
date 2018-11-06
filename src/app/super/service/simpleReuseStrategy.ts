import {
    RouteReuseStrategy,
    DefaultUrlSerializer,
    ActivatedRouteSnapshot,
    DetachedRouteHandle
} from "@angular/router";

/**
 * @description 路由复用策略
 * @author Yangwd<277637411@qq.com>
 * @date 2018-10-12
 * @export
 * @class SimpleReuseStrategy
 * @implements {RouteReuseStrategy}
 */
export class SimpleReuseStrategy implements RouteReuseStrategy {
    _cacheRouters: { [key: string]: any } = {};

    public shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // 默认对所有路由复用 可通过给路由配置项增加data: { keep: true }来进行选择性使用
        // {path: 'search', component: SearchComponent, data: {keep: true}},
        if ("data" in route && route.data["keep"] === false) {
            return false;
        } else {
            return true;
        }
    }

    public store(
        route: ActivatedRouteSnapshot,
        handle: DetachedRouteHandle
    ): void {
        // 按module作为key存储路由快照&组件当前实例对象
        this._cacheRouters[route.routeConfig.data.module] = {
            snapshot: route,
            handle: handle
        };
    }

    // 在缓存中有的都认为允许还原路由
    public shouldAttach(route: ActivatedRouteSnapshot): boolean {
        // login的时候默认清除路由缓存
        if (route.routeConfig.data.module === "login") {
            this._cacheRouters = {};
        }
        return (
            !!route.routeConfig &&
            !!this._cacheRouters[route.routeConfig.data.module]
        );
    }

    public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        // 从缓存中获取快照，若无则返回null
        if (
            !route.routeConfig ||
            route.routeConfig.loadChildren ||
            !this._cacheRouters[route.routeConfig.data.module]
        )
            return null;
        return this._cacheRouters[route.routeConfig.data.module].handle;
    }

    public shouldReuseRoute(
        future: ActivatedRouteSnapshot,
        curr: ActivatedRouteSnapshot
    ): boolean {
        // 同一路由时复用路由
        return future.routeConfig === curr.routeConfig;
    }

    public deleteRouteSnapshot(name: string): void {
        if (this._cacheRouters[name]) {
            delete this._cacheRouters[name];
        }
    }

    public deleteAllRouteSnapShot(): void {
        for (let key in this._cacheRouters) {
            delete this._cacheRouters[key];
        }
    }
}
