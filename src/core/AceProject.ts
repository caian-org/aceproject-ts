import { Method } from 'axios';

import { IWeek, WeekDay } from './Week';
import { IHttpResponse, HttpRequest } from './HttpRequest';


type HM = { [key: string]: any };
type ApiResponseStatus = 'ok' | 'fail';


interface IApiRequest
{
    method?: string;
    params?: HM;
}

export interface IAceProjectCredentials
{
    accountId: string;
    username: string;
    password: string;
}

export interface IAceApiResponse
{
    status: ApiResponseStatus;
    results: any[];
}

export interface IAceWorkItem
{
    userId: number;
    taskId: number;
    hours: number;
    when: IWeek;
    timeTypeId?: number;
    timeSheetLineId?: number;
}


export class AceProject extends HttpRequest
{
    private url: string;
    private guid: string;
    private connection?: IAceProjectCredentials;

    public constructor(c?: IAceProjectCredentials)
    {
        super();

        this.url = 'https://api.aceproject.com';

        this.connection = c;
        this.guid = '';
    }

    public setConnectionCredentials(c: IAceProjectCredentials): void
    {
        this.connection = c;
    }

    public setGuid(g: string): void
    {
        this.guid = g;
    }

    public async apiCall(func: string, req: IApiRequest = {}): Promise<IAceApiResponse>
    {
        const method = req.method ? req.method : 'get';

        if (!req.params) {
            req.params = {};
        }

        /* Parâmetros básicos de requisição -- formato esperado, idioma etc */
        req.params.fct = func;
        req.params.format = 'JSON';
        req.params.language = 'en-US';
        req.params.browserInfo = 'NULL';

        /* Inclui GUID caso já tenha sido obtido */
        if (this.guid !== '') {
            req.params.guid = this.guid;
        }

        const res: IHttpResponse = await this.request(this.url, req.params, method as Method);
        if (res.error) {
            throw new Error(`[AceProject] ${res.content}`);
        }

        return res.content.data;
    }

    public async isExpired(): Promise<boolean>
    {
        return (await this.apiCall('getaccount')).status === 'fail';
    }

    public async login(): Promise<string>
    {
        if (typeof(this.connection) === 'undefined') {
            throw new Error('[AceProject] credentials not set');
        }

        const res: IAceApiResponse = await this.apiCall('login', {
            params: {
                accountId: this.connection!.accountId,
                username:  this.connection!.username,
                password:  this.connection!.password,
            },
        });

        if (res.status === 'fail') {
            const error = res.results[0];
            const errId = error.ERRORNUMBER;
            const errDescr = error.ERRORDESCRIPTION;

            throw new Error(`[AceProject] ${errDescr} (${errId})`);
        }

        const accInfo = res.results[0];
        this.guid = accInfo.GUID;

        return this.guid;
    }

    public async getProjects(userId = 0): Promise<IAceApiResponse>
    {
        const params: HM = {};

        if (userId > 0) {
            params.filterAssignedUserId = userId;
        }

        return await this.apiCall('getProjects', { params });
    }

    public async getTasks(userId = 0, projectId = 0): Promise<IAceApiResponse>
    {
        if (projectId == 0 && userId == 0) {
            throw new Error('[AceProject] "projectId" or "userId" must be defined');
        }

        const params: HM = {};

        if (userId > 0) {
            params.filterAssignedUserId = userId;
        }

        if (projectId > 0) {
            params.projectId = projectId;
        }

        return await this.apiCall('getTasks', { params });
    }

    public async getTimeTypes(): Promise<IAceApiResponse>
    {
        return await this.apiCall('getTimeTypes');
    }

    public async getTaskInfo(taskId: number): Promise<IAceApiResponse>
    {
        return await this.apiCall('getTaskInfo', {
            params: { taskId },
        });
    }

    public async getWorkItems(timePeriodId: number): Promise<IAceApiResponse>
    {
        return await this.apiCall('getMyWorkItems', {
            params: { timePeriodId },
        });
    }

    public async saveWorkItem(w: IAceWorkItem): Promise<IAceApiResponse>
    {
        let ttid = 1;
        if (w.timeTypeId) {
            ttid = w.timeTypeId;
        }

        const params: HM = {
            userId: w.userId,
            taskId: w.taskId,
            weekStart: w.when.startDate,
            timeTypeId: ttid,
        };

        if (w.timeSheetLineId) {
            params.timeSheetLineId = w.timeSheetLineId;
        }

        switch (w.when.currentDay) {
            case WeekDay.Sunday: {
                params.hoursDay1 = w.hours;
                break;
            }

            case WeekDay.Monday: {
                params.hoursDay2 = w.hours;
                break;
            }

            case WeekDay.Tuesday: {
                params.hoursDay3 = w.hours;
                break;
            }

            case WeekDay.Wednesday: {
                params.hoursDay4 = w.hours;
                break;
            }

            case WeekDay.Thursday: {
                params.hoursDay5 = w.hours;
                break;
            }

            case WeekDay.Friday: {
                params.hoursDay6 = w.hours;
                break;
            }

            case WeekDay.Saturday: {
                params.hoursDay7 = w.hours;
                break;
            }

        }

        return await this.apiCall('saveWorkItem', { params });
    }
}
