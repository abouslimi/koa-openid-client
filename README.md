# KOA OpenID Client

## Overview

The library supports:
- Authorization using `Code` Flow.
- `Auth0`



## Install

Install with npm:
```bash
npm i --save koa-openid-client
```

## Usage

```javascript
import KoaOpenID from "koa-openid-client";
```

```javascript
const openid = new KoaOpenID({
    auth_required: true,
    base_uri: "<domain>",
    issuer_base_uri: "https://<domain>.auth0.com/",
    scope: "openid profile email",
    client_id: "<client_id>",
    client_secret: "<client_secret>",
    secret: "<secret_or_jwks>",
    jwks: {
        jwksUri: "https://<domain>.auth0.com/.well-known/jwks.json",
    },
});
```

```javascript
app.use(openid.router.routes()).use(openid.router.allowedMethods()); // use auth routes
app.use(openid.auth().unless({ path: [/^\/api\//] })); // use auth middleware
```
