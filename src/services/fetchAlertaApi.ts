import { UserPreferences } from "../model/userPreferences"

export const getServices = (userPref: UserPreferences): Promise<string[]> => {
    return fetch(`${userPref.alertaApiServerUrl}services`, { method: "GET", headers: getHeaders(userPref) }).then(response => response.json()).then(json => json.services).then(services => services.map((x: { service: any; }) => x.service));
}

export const getGroups = (userPref: UserPreferences): Promise<string[]> => {
    return fetch(`${userPref.alertaApiServerUrl}alerts/groups`, { method: "GET", headers: getHeaders(userPref) }).then(response => response.json()).then(json => json.groups).then(groups => groups.map((x: { group: any; }) => x.group));
}

export const getEnvironments = (userPref: UserPreferences): Promise<string[]> => {
    return fetch(`${userPref.alertaApiServerUrl}environments`, { method: "GET", headers: getHeaders(userPref) }).then(response => response.json()).then(json => json.environments).then(environments => environments.map((x: { environment: any; }) => x.environment));
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