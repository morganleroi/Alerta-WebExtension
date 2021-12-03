import { AlertaExtStore } from "../model/extensionState";
import { ackAlert, openAlert, openAlerta } from "./notificationActions";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

beforeEach(() => {
    fetchMock.resetMocks();

    global.chrome.windows = {
        update: jest.fn()
    } as any;

    jest.clearAllMocks();
});

test('Should open Alerta in a new tab', () => {
    openAlerta({
        userPreferences: {
            alertaUiUrl: "https://myAlertaServer/ui/"
        },
    } as AlertaExtStore)

    expect(chrome.tabs.create).toHaveBeenCalledWith({ active: true, url: "https://myAlertaServer/ui/" }, expect.anything());
    expect(chrome.windows.update).toHaveBeenCalled();
});

test('Should open a specific alert in a new tab', () => {
    openAlert({
        userPreferences: {
            alertaUiUrl: "https://myAlertaServer/ui/"
        },
    } as AlertaExtStore, "myNodifId", "1324657")

    expect(chrome.tabs.create).toHaveBeenCalledWith({ active: true, url: "https://myAlertaServer/ui/alert/1324657" }, expect.anything());
    expect(chrome.windows.update).toHaveBeenCalled();
});

test('Should ack the alert in Alerta when clicking on Ack button', () => {
    // Given
    const state = {
        userPreferences: {
            alertaApiServerUrl: "https://myAlertaServer/api/",
            alertaApiSecret: "SecretKey", 
            username: "Morgan"
        },
    } as AlertaExtStore

    const fetchMockAlerta = fetchMock.mockOnce("");

    // When
    ackAlert(state, "MyNotifId", "1324")

    // Then
    expect(fetchMockAlerta.mock.calls.length).toEqual(1);
    expect(fetchMockAlerta.mock.calls[0][0]).toEqual("https://myAlertaServer/api/alert/1324/status");

    const expectedPayload = {
        body: JSON.stringify({
            status: "ack",
            text: "Morgan: I'll take a look ..."
        }),
        headers: {
            "Authorization": "Key SecretKey",
            "Content-type": "application/json"
        },
        method: "PUT"
    }

    expect(fetchMockAlerta.mock.calls[0][1]).toEqual(expectedPayload)
});

test('Should clear notification when opening new tab', () => {
    openAlerta({
        userPreferences: {
            alertaUiUrl: "https://myAlertaServer/ui/"
        },
    } as AlertaExtStore, "1234")

    expect(chrome.notifications.clear).toHaveBeenCalledWith("1234");
});