import axios, { AxiosInstance, AxiosResponse } from "axios";
import 'dotenv/config'


export type ErrorResponse = {
    name: string;
    error: string;
}

export type LocationDetails = {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state: string;
}

export type ZipDetails = {
    zip: string,
    name: string;
    lat: number;
    lon: number;
    country: string;
}


export class GeoLocationAPI {

    request: AxiosInstance
    usaCountryCode: string

    constructor() {
        this.usaCountryCode = 'us';
        this.request = axios.create({
            baseURL: 'http://api.openweathermap.org/geo/1.0',
            method: 'GET',
            params: {
                appid: process.env.API_KEY
            },
            validateStatus: function (status) {
                return status >= 200 && status <= 404
            }
        })
    }

    async getByZipCode(zipCode: string): Promise<ZipDetails | ErrorResponse> {
        const response: AxiosResponse = await this.request({
            url: '/zip?',
            params: {
                zip: `${zipCode},${this.usaCountryCode}`
            }
        })
        if (response.status === 200) {
            return response.data as ZipDetails
        } else {
            return this.printErrorMsgFor(zipCode)
        }
    }

    async getByLocationName(location: string): Promise<LocationDetails | ErrorResponse> {
        const response: AxiosResponse = await this.request({
            url: '/direct?',
            params: {
                limit: 1,
                q: `${location}, ${this.usaCountryCode}`
            }
        })
        if (response.status === 200 && response.data.length !== 0) {
            const [firstLocationDetails] = response.data
            delete firstLocationDetails.local_names
            return firstLocationDetails as LocationDetails
        } else {
            return this.printErrorMsgFor(location)
        }
    }

    printErrorMsgFor(ZipOrLocation: string): ErrorResponse {
        const errorMsg: ErrorResponse = {
            name: ZipOrLocation,
            error: "Please check input value and try again"
        }
        return errorMsg
    }
}