import app from "./app";
import env from "./config/env";

async function bootstrap(): Promise<void> {

    try {

        app.listen(env.PORT, env.HOST, () => {

            console.clear();

            console.log("========================================");
            console.log(" GCC HR Enterprise Backend");
            console.log("========================================");
            console.log(` Environment : ${env.NODE_ENV}`);
            console.log(` Server      : http://${env.HOST}:${env.PORT}`);
            console.log("========================================");

        });

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

}

bootstrap();
