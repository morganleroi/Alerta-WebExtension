export type AlertQueryResponse = {
    alerts: Alert[];
}

export type Alert = {
    id: string;
    event: string;
    value?: string;
    service: string[]
}