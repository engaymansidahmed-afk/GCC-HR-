import app from "./app";

import env from "./config/env";

const PORT = env.PORT;
const HOST = env.HOST;

app.listen(PORT, HOST, () => {
    console.log("========================================");
    console.log(" GCC HR Enterprise Backend");
    console.log("========================================");
    console.log(` Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(` Server      : http://${HOST}:${PORT}`);
    console.log("========================================");
});
