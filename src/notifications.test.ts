import { AlertaExtStore } from "./Model/AlertaExtStore";
import { SendNotification } from "./notifications";

beforeEach(() => {
    jest.clearAllMocks();
  });

test('Should not launch notification if notification disabled in user preference', () => {
    SendNotification({
        userPreferences: {
            ShowNotifications: false
        }
    } as AlertaExtStore, 1, { });
    expect(chrome.notifications.create).not.toHaveBeenCalled();
});

test('Should launch notification if new alerts', () => {
    SendNotification({
        pollingState: {
            alertCount: 0
        },
        userPreferences: {
            PersistentNotifications: false,
            ShowNotifications: true
        }
    } as AlertaExtStore, 1, { alerts:[
        {
            id: "1",
            service: ["MyService"],
            event:  "MyEvent"
        }
    ]});
    expect(chrome.notifications.create).toHaveBeenCalled();
});

test('Should do nothing if no new alert', () => {
    SendNotification({
        pollingState: {
            alertCount: 1
        },
        userPreferences: {
            ShowNotifications: true
        }
    } as AlertaExtStore, 1, { alerts:[
        {
            id: "1",
            service: ["MyService2"],
            event:  "MyEvent2"
        }
    ]});
    expect(chrome.notifications.create).not.toHaveBeenCalled();
});