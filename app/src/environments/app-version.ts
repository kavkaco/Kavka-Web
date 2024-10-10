import { environment } from "@environments/environment";

const appVersion = require("../../package.json").version;
let finalAppVersion = appVersion;

if (!environment.production) {
    finalAppVersion = "dev-" + appVersion;
}

export default finalAppVersion;
