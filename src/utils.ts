import { verifyJwt } from "./jwt";

const verifyToken = async function (token: string): Promise<boolean> {
    const jwtDecoded = await verifyJwt(token).catch((err) => {
        throw err;
    });
    return !!jwtDecoded;
};

const decodeJwt = function (token: string) {
    return verifyJwt(token);
};

export {
    verifyToken,
    decodeJwt,
};
