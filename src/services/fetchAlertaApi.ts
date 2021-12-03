import { UserPreferences } from "../model/userPreferences"

export const getServices = (userPref: UserPreferences): Promise<any> => {
    return fetch(`${userPref.alertaApiServerUrl}services`, { method: "GET", headers: getHeaders(userPref) }).then(response => response.json())
}

export const getGroups = (userPref: UserPreferences): Promise<any> => {
    return fetch(`${userPref.alertaApiServerUrl}alerts/groups`, { method: "GET", headers: getHeaders(userPref) }).then(response => response.json())
}

export const getEnvironments = (userPref: UserPreferences): Promise<any> => {
    return fetch(`${userPref.alertaApiServerUrl}environments`, { method: "GET", headers: getHeaders(userPref) }).then(response => response.json())
}

const getHeaders = (userPref: UserPreferences): HeadersInit => {
    return { "Content-type": "application/json", 'Authorization': `Key ${userPref.alertaApiSecret}` }
}

export function createFetchQuery(userPreferences: UserPreferences) {
    const buildedQuery = buildQueryParameters("group", userPreferences.filterGroups) + buildQueryParameters("service", userPreferences.filterServices) + buildQueryParameters("environment", userPreferences.filterEnvironments);
    return "status=open&status=ack&sort-by=lastReceiveTime" + ((buildedQuery === "") ? "" : buildedQuery);
}

const buildQueryParameters = (paramName: string, parameters: string[]): string => {
    if (parameters.length > 0) {
        const reducer = (accumulator: string, currentValue: string) => accumulator + `&${paramName}=${currentValue}`;
        return parameters.reduce(reducer, "");
    }
    return "";
}