import "../controller/lecture.controller";
import { Container } from "inversify";
import { TYPES } from "./types.config";
import { App } from "../app";
import { LectureService } from "../service/lecture.service";
import { WiseService } from "../service/wise.service";

const IoCContainer = new Container();
IoCContainer.bind<App>(TYPES.App).to(App).inSingletonScope();
IoCContainer.bind<LectureService>(TYPES.LectureService).to(LectureService).inSingletonScope();
IoCContainer.bind<WiseService>(TYPES.WiseService).to(WiseService).inSingletonScope();

export { IoCContainer };