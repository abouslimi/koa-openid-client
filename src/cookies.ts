import Koa from "koa";
import { oidconfig } from "./config";

const cookies = {
    idtoken: oidconfig.cookies?.idtoken?? "oidc.token",
    accessToken: oidconfig.cookies?.accessToken?? "oidc.session",
    user: oidconfig.cookies?.user?? "oidc.user",
};

const getIdTokenCookie = function(ctx: Koa.ParameterizedContext) {
    return ctx.cookies.get(cookies.idtoken);
};

const setIdTokenCookie = function(ctx: Koa.ParameterizedContext, token?: string, opts?: any) {
    ctx.cookies?.set(cookies.idtoken, token, opts);
};

const getAccessTokenCookie = function(ctx: Koa.ParameterizedContext) {
    return ctx.cookies.get(cookies.accessToken);
};

const setAccessTokenCookie = function(ctx: Koa.ParameterizedContext, token?: string, opts?: any) {
    ctx.cookies?.set(cookies.accessToken, token, opts);
};

const getUserCookie = function(ctx: Koa.ParameterizedContext) {
    const userCookie = ctx.cookies.get(cookies.user);
    return userCookie? JSON.parse(userCookie) : undefined;
};

const setUserCookie = function(ctx: Koa.ParameterizedContext, user?: any, opts?: any) {
    ctx.cookies?.set(cookies.user, JSON.stringify(user), opts);
};

export {
    cookies,
    getIdTokenCookie,
    setIdTokenCookie,
    getAccessTokenCookie,
    setAccessTokenCookie,
    getUserCookie,
    setUserCookie,
};
