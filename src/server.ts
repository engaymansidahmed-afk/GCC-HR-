import app from "./app";

import env from "./config/env";

const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log("========================================");
    console.log(" GCC HR Enterprise Backend");
    console.log("========================================");
    console.log(` Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(` Server      : http://${HOST}:${PORT}`);
    console.log("========================================");
});
