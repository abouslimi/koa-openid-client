import { OpenIDConfig } from "./types";

let oidconfig = {} as OpenIDConfig;

const setConfig = function(config: OpenIDConfig) {
    oidconfig = config;
};

export {
    oidconfig,
    setConfig,
};
