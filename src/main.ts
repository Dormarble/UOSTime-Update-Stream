import { App } from "./app";
import { IoCContainer } from "./config/inversify.config";
import { TYPES } from "./config/types.config";
import dotenv from 'dotenv'

dotenv.config()

const app: App = IoCContainer.get<App>(TYPES.App);
app.listen();