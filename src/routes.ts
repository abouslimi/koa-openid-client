import Koa from "koa";
import Router from "@koa/router";
import { oidconfig } from "./config";
import { setAccessTokenCookie, setIdTokenCookie, setUserCookie } from "./cookies";
import { getAuth0LogoutUrl, getLoginUrl, getRegisterURL, getTokenUsingCode, getUserInfoUsingToken } from "./helpers";
import { decodeJwt, verifyToken } from "./utils";

const getOAuthRouter = function(): Router {
    const router = new Router({
        prefix: "/oauth",
    });
    router.get("/callback", callback);
    router.get("/login", login);
    router.get("/logout", logout);
    router.get("/register", register);
    return router;
};

const callback = async function(ctx: Koa.ParameterizedContext) {
    if (ctx.query.error) {
        ctx.status = 500;
        ctx.body = {
            error: ctx.query.error,
            error_description: ctx.query.err,
        };
    } else if (ctx.query.code) {
        const tokenJson = await getTokenUsingCode(ctx.query.code as string);
        if (tokenJson.id_token) {
            const idTokenVerified = await verifyToken(tokenJson.id_token);
            if (idTokenVerified) {
                const userInfo = await decodeJwt(tokenJson.id_token);
                setUserCookie(ctx, userInfo);
                setIdTokenCookie(ctx, tokenJson.id_token, {
                    expires: new Date(tokenJson.expires_in * 1000 + +new Date()),
                    maxAge: 10 * 3600 * 1000,
                });
                setAccessTokenCookie(ctx, tokenJson.access_token, {
                    expires: new Date(tokenJson.expires_in * 1000 + +new Date()),
                    maxAge: 10 * 3600 * 1000,
                });
            }
        } else if (tokenJson.access_token) {
            const userInfo = await getUserInfoUsingToken(tokenJson.access_token);
            if (userInfo) {
                setUserCookie(ctx, userInfo);
                setAccessTokenCookie(ctx, tokenJson.access_token, {
                    expires: new Date(tokenJson.expires_in * 1000 + +new Date()),
                    maxAge: 10 * 3600 * 1000,
                });
            }
        }
        ctx.redirect(ctx.query.return_url as string || "/");
    } else {
        ctx.status = 400;
        ctx.body = {
            error: "Bad request",
            error_description: "Query parameter `code` is required.",
        };
    }
};

const login = function(ctx: Koa.ParameterizedContext): void {
    ctx.redirect(getLoginUrl(ctx.state.return_url));
};

const logout = async function(ctx: Koa.ParameterizedContext): Promise<void> {
    const returnUrl = ctx.query.return_url as string;
    setUserCookie(ctx);
    setIdTokenCookie(ctx);
    setAccessTokenCookie(ctx);
    if (
        oidconfig.auth0_logout ||
        new URL(oidconfig.issuer_base_uri).hostname.match("\\.auth0\\.com$")
    ) {
        ctx.redirect(getAuth0LogoutUrl(returnUrl));
    } else {
        ctx.redirect(returnUrl || "/");
    }
};

const register = function(ctx: Koa.BaseContext): void {
    ctx.redirect(getRegisterURL() || getLoginUrl());
};

export {
    getOAuthRouter,
    callback,
    login,
    logout,
    register,
};
