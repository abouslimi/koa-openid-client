import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { oidconfig } from "./config";

const verifyJwt = function(token: string) {
    return new Promise((resolve, reject) => {
        if (oidconfig.noverify_jwt) {
            resolve(jwt.decode(token));
        } else {
            if (!oidconfig.secret) {
                if (oidconfig.jwks) {
                    oidconfig.secret = getSigningKey; 
                } else {
                    throw new Error("`secret` is required.");
                }
            }
            jwt.verify(
                token, 
                oidconfig.secret, 
                oidconfig.algorithm? {
                    algorithms: [oidconfig.algorithm],
                } : {},
                (err: any, decoded: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded);
                    }
                }
            );
        }
    });
};

const getSigningKey = function(header: any, callback: any) {
    if (!oidconfig.jwks) {
        throw new Error("`jwks` is required.");
    }
    const client = jwksClient(oidconfig.jwks);
    client.getSigningKey(header.kid, function (err, key: any) {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(err, signingKey);
    });
};
export { verifyJwt, getSigningKey };
