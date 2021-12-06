import { defaultState } from "../model/extensionState";
import { sendNotification } from "./notifications";
import { PlaySound } from "../services/playSound";
jest.mock('../services/playSound');

beforeEach(() => {
    jest.clearAllMocks();
});

test('Should not launch notification if notification disabled in user preference', () => {
    // Given
    const state = {
        userPreferences: { ...defaultState.userPreferences },
        pollingState: { ...defaultState.pollingState }
    };

    state.pollingState.isNewState = false;
    state.userPreferences.showNotifications = false;

    // When
    sendNotification(state, [{
        id: "1",
        service: ["MyService"],
        event: "MyEvent",
        text: "This is a test"
    }]);

    // Then
    expect(chrome.notifications.create).not.toHaveBeenCalled();
});

test('Should launch notification if new alerts', () => {
    // Given
    const state = {
        userPreferences: { ...defaultState.userPreferences },
        pollingState: { ...defaultState.pollingState }
    };

    state.pollingState.isNewState = false;

    // When
    sendNotification(state, [{
        id: "1",
        service: ["MyService"],
        event: "MyEvent",
        text: "This is a test"
    }]);

    // Then
    const expectedAlert = {
        type: 'basic',
        title: `MyService - MyEvent`,
        message: "This is a test",
        iconUrl: "alert.png",
        isClickable: true,
        requireInteraction: false,
        buttons: [{ title: 'Ack' }, { title: 'View alert details' }],
    }

    expect(chrome.notifications.create).toHaveBeenCalledWith("Alert_1", expectedAlert);
});

test('Should launch persistant notification if enabled in user preference', () => {
    // Given
    const state = {
        userPreferences: { ...defaultState.userPreferences },
        pollingState: { ...defaultState.pollingState }
    };

    state.pollingState.isNewState = false;
    state.userPreferences.persistentNotifications = true;

    // When
    sendNotification(state, [{
        id: "1",
        service: ["MyService"],
        event: "MyEvent",
        text: "This is a test"
    }]);

    // Then
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
    // Given
    const state = {
        userPreferences: { ...defaultState.userPreferences },
        pollingState: { ...defaultState.pollingState }
    };

    state.pollingState.isNewState = false;

    sendNotification(state, [{
        id: "1",
        service: ["MyService2"],
        event: "MyEvent2"
    }, {
        id: "2",
        service: ["MyService3"],
        event: "MyEvent3"
    }]);

    const expectedListAlert = {
        type: 'list',
        title: `2 new alerts detected !`,
        message: 'Click to open Alerta',
        items: [{
            message: " ",
            title: "MyService2 - MyEvent2"
        }, {
            message: " ",
            title: "MyService3 - MyEvent3",
        }],
        iconUrl: "alert.png",
        isClickable: true,
        buttons: [{ title: 'Go to alerta' }]
    }

    expect(chrome.notifications.create).toHaveBeenCalledWith("GoToAlertaHome", expectedListAlert);
});

test('Should not launch notification if no new alert', () => {
    // Given
    const state = {
        userPreferences: { ...defaultState.userPreferences },
        pollingState: { ...defaultState.pollingState }
    };

    state.pollingState.isNewState = false;

    // when
    sendNotification(state, []);

    // then
    expect(chrome.notifications.create).not.toHaveBeenCalled();
});

test('Should not launch notification if alerts has not been fetched for the first time', () => {
    // Given
    const state = {
        userPreferences: { ...defaultState.userPreferences },
        pollingState: { ...defaultState.pollingState }
    };

    state.pollingState.isNewState = true;

    // When
    sendNotification(state, [{
        id: "1",
        service: ["MyService2"],
        event: "MyEvent2"
    }]);

    // Then
    expect(chrome.notifications.create).not.toHaveBeenCalled();
});

test('Should play a sound if selected in user preferences', () => {
    // Given
    const state = {
        userPreferences: { ...defaultState.userPreferences },
        pollingState: { ...defaultState.pollingState }
    };

    state.pollingState.isNewState = false;
    state.userPreferences.playAudio = true;

    // when
    sendNotification(state, [{
        id: "1",
        service: ["MyService2"],
        event: "MyEvent2"
    }]);

    // then
    expect(PlaySound).toHaveBeenCalled();
});
