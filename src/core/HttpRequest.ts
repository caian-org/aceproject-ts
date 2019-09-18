import axios from 'axios';
import { AxiosRequestConfig, Method } from 'axios';


export interface IHttpResponse
{
    error: boolean;
    content: any;
}

export interface IHttpHeader
{
    'Content-Type'?: string;
    'Authorization'?: string;
}


export class HttpRequest
{
    protected headers: IHttpHeader;

    public constructor()
    {
        this.headers = {};
    }

    private async perform(payload: AxiosRequestConfig): Promise<IHttpResponse>
    {
        let error = false;
        let content: object;

        try {
            content = await axios(payload);
        }
        catch (e) {
            error = true;
            content = e;
        }

        const ret: IHttpResponse = { error, content };
        return ret;
    }

    protected async request(url: string, data: object, method: Method = 'get'): Promise<IHttpResponse>
    {
        const payload: AxiosRequestConfig = { url, method, headers: this.headers };

        if (data) {
            if (method === 'get') {
                payload.params = data;
            }
            else {
                payload.data = data;
            }
        }

        return await this.perform(payload);
    }
}
