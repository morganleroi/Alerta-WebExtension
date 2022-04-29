export type AlertQueryResponse = {
  alerts: Alert[];
};

export type Alert = {
  id: string;
  event: string;
  text?: string;
  service: string[];
};
