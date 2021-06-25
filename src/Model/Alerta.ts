export type AlertaAlertQueryResponse = {
    alerts: Alert[];
}

export type Alert = {
    id: string;
    event: string;
    value?: string;
    service: string[]
}