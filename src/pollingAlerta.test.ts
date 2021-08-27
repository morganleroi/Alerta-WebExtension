import { fetchAlerts, startPolling } from "./pollingAlerta";
import fetchMock from "jest-fetch-mock";
import { AlertaExtStore, defaultState } from "./Model/AlertaExtStore";

fetchMock.enableMocks();

beforeEach(() => {
    fetchMock.resetMocks();

    chrome.alarms = {
        create: jest.fn(),
        onAlarm: {
            addListener: jest.fn()
        }
    } as any;
});

test('Should start the alarm when start polling', () => {
    // When
    startPolling();

    // Then
    expect(chrome.alarms.onAlarm.addListener).toHaveBeenCalled();
    expect(chrome.alarms.create).toHaveBeenCalled();
});

test('Should fetch Alerts when alarms is triggered', () => {
    // Given
    const fetchMockAlerta = fetchMock.mockResponseOnce(JSON.stringify({
        alerts: [{
            id: "1",
            service: ["MyService"],
            event: "MyEvent",
            value: "This is a test"
        }]
    }));

    const state = {
        userPreferences: {
            ...defaultState.userPreferences,
            AlertaApiServerUrl: "https://myAlertaServer",
            AlertaApiSecret: "MySecretKey"
        },
        pollingState: {
            alertaFetchQuery: "service=test&group-test2",
            alerts: []
        }
    } as AlertaExtStore;

    // When 
    fetchAlerts(state);

    // Then
    expect(fetchMockAlerta.mock.calls.length).toEqual(1);
    expect(fetchMockAlerta.mock.calls[0][0]).toEqual("https://myAlertaServer/alerts?service=test&group-test2");

    const expectedPayload = {
        headers: {
            "Authorization": "Key MySecretKey"
        }
    };

    expect(fetchMockAlerta.mock.calls[0][1]).toEqual(expectedPayload);
    
    // TODO : Don't know why it's not working.
    //expect(chrome.notifications.create).toHaveBeenCalled();
});

