import fetch from "node-fetch";
import { oidconfig } from "./config";
import { verifyToken } from "./utils";
import { TokenSet } from "./types";

const getLoginUrl = function (returnUrl?: string): string {
    const redirectUri = returnUrl? oidconfig.redirect_uri+"?return_url="+encodeURIComponent(returnUrl) : oidconfig.redirect_uri;
    const loginQueryParams = {
        response_type: "code",
        scope: oidconfig.scope,
        client_id: oidconfig.client_id,
        redirect_uri: redirectUri,
        state: oidconfig.state,
    };
    const paramsStr = Object.entries(loginQueryParams).map((arr) => {
        return `${arr[0]}=${encodeURIComponent(arr[1] ?? "")}`;
    }).join("&");
    return `${oidconfig.authorize_uri}?${paramsStr}`;
};

const getRegisterURL = function (): string | undefined {
    return oidconfig.register_uri;
};

const getAuth0LogoutUrl = function (returnUrl: string = oidconfig.base_uri) {
    const auth0LogoutUrl = oidconfig.issuer_base_uri + "/v2/logout";
    const auth0LogoutQueryParams = `client_id=${encodeURIComponent(oidconfig.client_id)}&returnTo=${encodeURIComponent(new URL(returnUrl).href)}`;
    return auth0LogoutUrl + "?" + auth0LogoutQueryParams;
};

const getTokenUsingCode = async function (code: string): Promise<TokenSet> {
    if (!oidconfig.token_uri) {
        throw new Error("`token_uri` is required.");
    }
    const tokenRequestUrl = oidconfig.token_uri;
    const tokenRequestQueryParams = `grant_type=authorization_code&code=${code}&redirect_uri=${oidconfig.redirect_uri}`;
    const authorizationToken = Buffer.from(
        `${oidconfig.client_id}:${oidconfig.client_secret}`
    ).toString("base64");
    const tokenRequestHeaders = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authorizationToken}`,
    };
    return await fetch(tokenRequestUrl, {
        method: "POST",
        body: tokenRequestQueryParams,
        headers: tokenRequestHeaders,
    }).then((res) => res.json() as unknown as TokenSet);
};

const getUserInfoUsingCode = async function (code: string) {
    const tokenJson = await getTokenUsingCode(code);
    const idTokenVerified = await verifyToken(tokenJson.id_token);
    if (idTokenVerified) {
        return await getUserInfoUsingToken(tokenJson.access_token)
            .then((userInfo) => {
                return {
                    error: "",
                    userInfo
                };
            })
            .catch((err: Error) => {
                return {
                    error: err.name,
                    error_description: err.message,
                };
            });
    } else {
        return {
            error: "id_token is invalid",
            error_description: "id_token is invalid",
        };
    }
};

const getUserInfoUsingToken = async function (accessToken: string) {
    if (!oidconfig.userinfo_uri) {
        throw new Error("`userinfo_uri` is required.");
    }
    const userInfoResponse = await fetch(oidconfig.userinfo_uri, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
    });
    return await userInfoResponse.json();
};

export {
    getLoginUrl,
    getRegisterURL,
    getUserInfoUsingCode,
    getUserInfoUsingToken,
    getTokenUsingCode,
    getAuth0LogoutUrl,
};
