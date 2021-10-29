import { UserPreferences } from "../model/userPreferences"

export const getServices = (userPref: UserPreferences): Promise<any> => {
    return fetch(`${userPref.alertaApiServerUrl}/services`, { method: "GET", headers: { "Content-type": "application/json", 'Authorization': `Key ${userPref.alertaApiSecret}` } })
        .then(response => response.json())
}

export const getGroups = (userPref: UserPreferences): Promise<any> => {
    return fetch(`${userPref.alertaApiServerUrl}/alerts/groups`, { method: "GET", headers: { "Content-type": "application/json", 'Authorization': `Key ${userPref.alertaApiSecret}` } })
        .then(response => response.json())
}

export function createFetchQuery(services: string[], groups: string[]) {
    return buildQueryParameters("group", groups) + buildQueryParameters("service", services);
}

const buildQueryParameters = (paramName: string, parameters: string[]): string => {
    if (parameters.length > 0) {
        const reducer = (accumulator: string, currentValue: string) => accumulator + `&${paramName}=${currentValue}`;
        return "environment=Production&status=open&status=ack&sort-by=lastReceiveTime" + parameters.reduce(reducer, "");
    }
    return "environment=Production&status=open&status=ack&sort-by=lastReceiveTime";
}