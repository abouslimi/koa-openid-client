import Koa from "koa";
import { GetPublicKeyOrSecret, Secret, Algorithm } from "jsonwebtoken";
import { Options as JwksOptions } from "jwks-rsa";

export interface TokenSet {
    id_token: string;
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    [key: string]: any;
}

export interface AuthCookies {
    idtoken: string;
    accessToken: string;
    user: string;
}

export interface DefaultConfig {
    base_uri: string;
    issuer_base_uri: string;
    authorize_uri?: string;
    token_uri?: string;
    userinfo_uri?: string;
    scope?: string;
}

export interface ProviderConfig {
    redirect_uri?: string;
    register_uri?: string;
    client_id: string;
    client_secret: string;
    secret?: Secret | GetPublicKeyOrSecret;
    jwks?: JwksOptions,
    algorithm?: Algorithm;
    state?: string;
}

export interface OpenIDConfig extends DefaultConfig, ProviderConfig {
    auth_required: boolean;
    auth0_logout?: boolean;
    cookies?: AuthCookies;
    noverify_jwt?: boolean;
}

export type UnlessOptions = (params?: {custom?: (ctx: Koa.Context) => boolean, path?: string | RegExp | (string | RegExp)[], ext?: string | string[],  method?: string | string[]}) => Koa.Middleware;

export interface Middleware extends Koa.Middleware {
    unless: UnlessOptions;
}
