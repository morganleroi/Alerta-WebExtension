import { AlertaAlertQueryResponse } from "./Model/Alerta";
import { AlertaExtStore } from "./Model/AlertaExtStore";
import { SendNotification } from "./notifications";
import { PlaySound } from "./playSound";
jest.mock('./playSound');

beforeEach(() => {
    jest.clearAllMocks();
});

test('Should not launch notification if notification disabled in user preference', () => {
    SendNotification({
        userPreferences: {
            ShowNotifications: false
        }
    } as AlertaExtStore, {} as AlertaAlertQueryResponse);
    expect(chrome.notifications.create).not.toHaveBeenCalled();
});

test('Should not launch notification when retrieving for the first time alerta state', () => {
    SendNotification({
        userPreferences: {
            ShowNotifications: true,
        },
        pollingState: {
            alertCount: undefined
        }
    } as AlertaExtStore, {} as AlertaAlertQueryResponse);
    expect(chrome.notifications.create).not.toHaveBeenCalled();
});

test('Should launch notification if new alerts', () => {
    SendNotification({
        pollingState: {
            alertCount: 0
        },
        userPreferences: {
            ShowNotifications: true
        }
    } as AlertaExtStore, {
        alerts: [
            {
                id: "1",
                service: ["MyService"],
                event: "MyEvent",
                value: "This is a test"
            }
        ]
    });

    const expectedAlert = {
        type: 'basic',
        title: `MyService - MyEvent`,
        message: "This is a test",
        iconUrl: "alert.png",
        isClickable: true,
        buttons: [{ title: 'Ack' }, { title: 'View alert details' }],
    }

    expect(chrome.notifications.create).toHaveBeenCalledWith("Alert_1", expectedAlert);
});

test('Should launch persistant notification if enabled in user preference', () => {
    SendNotification({
        pollingState: {
            alertCount: 0
        },
        userPreferences: {
            ShowNotifications: true,
            PersistentNotifications: true
        }
    } as AlertaExtStore, {
        alerts: [
            {
                id: "1",
                service: ["MyService"],
                event: "MyEvent",
                value: "This is a test"
            }
        ]
    });

    const expectedAlert = {
        type: 'basic',
        title: `MyService - MyEvent`,
        message: "This is a test",
        requireInteraction: true,
        iconUrl: "alert.png",
        isClickable: true,
        buttons: [{ title: 'Ack' }, { title: 'View alert details' }],
    }

    expect(chrome.notifications.create).toHaveBeenCalledWith("Alert_1", expectedAlert);
});

test('Should launch a list notifications is more than one new alert', () => {
    SendNotification({
        pollingState: {
            alertCount: 0
        },
        userPreferences: {
            ShowNotifications: true,
        }
    } as AlertaExtStore, {
        alerts: [
            {
                id: "1",
                service: ["MyService2"],
                event: "MyEvent2"
            }, {
                id: "2",
                service: ["MyService3"],
                event: "MyEvent3"
            }
        ]
    });

    const expectedListAlert = {
        type: 'list',
        title: `2 new alerts detected !`,
        message: 'Click to open Alerta',
        items: [],
        iconUrl: "alert.png",
        isClickable: true,
        buttons: [{ title: 'Go to alerta' }]
    }

    expect(chrome.notifications.create).toHaveBeenCalledWith("GoToAlertaHome", expectedListAlert);
});

test('Should do nothing if no new alert', () => {
    SendNotification({
        pollingState: {
            alertCount: 1
        },
        userPreferences: {
            ShowNotifications: true
        }
    } as AlertaExtStore, {
        alerts: [
            {
                id: "1",
                service: ["MyService2"],
                event: "MyEvent2"
            }
        ]
    });
    expect(chrome.notifications.create).not.toHaveBeenCalled();
});

test('Should play a sound if selected in user preferences', () => {
    SendNotification({
        pollingState: {
            alertCount: 0
        },
        userPreferences: {
            ShowNotifications: true,
            playAudio: true
        }
    } as AlertaExtStore, {
        alerts: [
            {
                id: "1",
                service: ["MyService2"],
                event: "MyEvent2"
            }
        ]
    });
    expect(PlaySound).toHaveBeenCalled();
});