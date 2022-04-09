import "reflect-metadata";
import os from "os";
import { Application } from "express";
import { json } from "body-parser";
import { injectable } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import { IoCContainer } from "./config/inversify.config";

@injectable()
export class App {
    private app: Application;
    private inversifyExpressServer: InversifyExpressServer;

    constructor() {
        this.inversifyExpressServer = new InversifyExpressServer(IoCContainer);
        this.app = this.inversifyExpressServer
            .setConfig(this.initializeMiddlewares.bind(this))
            .build();
    }

    private initializeMiddlewares(app: Application) {
        app.use(json());
    }
    
    public getApp() {
        return this.app;
    }

    public listen() {
        const server = this.app.listen(process.env.PORT, this.printStartLog);
    }

    private printStartLog = () => {
       console.info(`App listening on the port: ${process.env.PORT}`);
       console.info(`host: ${os.hostname()}`)
    }
}
