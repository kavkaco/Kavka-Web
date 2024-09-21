export const environment = {
    production: false,
    debug: true,
    grpcTransportBaseUrl: "http://localhost:8000",
    appVersion: "dev-" + require("../../package.json").version,
};
