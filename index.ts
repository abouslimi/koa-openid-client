import { v4 as uuidv4 } from "uuid";
import Koa from "koa";
import Router from "@koa/router";
import { oidconfig, setConfig } from "./src/config";
import { getAccessTokenCookie, setUserCookie } from "./src/cookies";
import { login, getOAuthRouter } from "./src/routes";
import { Middleware, OpenIDConfig } from "./src/types";
import { getUserInfoUsingToken } from "./src/helpers";

/**
 * OpenID client for KOA framework.
 */
export default class KoaOpenID {
    router: Router;

    constructor(config: OpenIDConfig) {
        if (!config.state) {
            config.state = uuidv4();
        }
        config.base_uri = new URL(config.base_uri).origin;
        config.issuer_base_uri = new URL(config.issuer_base_uri).origin;
        if (!config.authorize_uri) {
            config.authorize_uri = config.issuer_base_uri + "/authorize";
        }
        if (!config.token_uri) {
            config.token_uri = config.issuer_base_uri + "/oauth/token";
        }
        if (!config.userinfo_uri) {
            config.userinfo_uri = config.issuer_base_uri + "/userinfo";
        }
        if (!config.scope) {
            config.scope = "openid profile email";
        }
        if (!config.redirect_uri) {
            config.redirect_uri = `${config.base_uri}/oauth/callback`;
        }
        setConfig(config);
        this.router = getOAuthRouter();
    }

    public auth(): Middleware {
        const middleware = this.middleware as Middleware;
        middleware.unless = require("koa-unless");
        return middleware;
    }

    private async middleware(ctx: Koa.ParameterizedContext, next: Koa.Next): Promise<Middleware> {
        const authRequired = oidconfig.auth_required ?? ctx.state.authRequired;
        if (authRequired && !ctx.path.match(/^\/oauth/)) {
            const token = getAccessTokenCookie(ctx);
            if (token) {
                await getUserInfoUsingToken(token)
                    .then((userInfo) => {
                        setUserCookie(ctx, userInfo);
                        if (!userInfo) {
                            ctx.throw(401, "Invalid access token.");
                        }
                    })
                    .catch((err) => {
                        ctx.throw(500, err);
                    });
            } else {
                ctx.state.return_url = ctx.path;
                login(ctx);
            }
        }
        return await next();
    }
}

export * from "./src/types";
