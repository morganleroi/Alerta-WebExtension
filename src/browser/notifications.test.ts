import { defaultState } from '../model/extensionState';
import { sendNotification } from './notifications';
import { playSound } from '../services/playSound';
import { setupMockAsChromium } from '../services/setupMock';

jest.mock('../services/playSound');

beforeEach(() => {
  jest.clearAllMocks();
  setupMockAsChromium();
});

test('Should not launch notification if notification disabled in user preference', () => {
  // Given
  // Here, we do not setup any mock on Notification. Meaning that is a call is made, then the test will fail.
  const state = {
    userPreferences: { ...defaultState.userPreferences },
    pollingState: { ...defaultState.pollingState },
  };

  state.pollingState.isNewState = false;
  state.userPreferences.showNotifications = false;

  // When
  sendNotification(state, [
    {
      id: '1',
      service: ['MyService'],
      event: 'MyEvent',
      text: 'This is a test',
    },
  ]);
});

test('Should launch notification if new alerts', () => {
  // Given
  const state = {
    userPreferences: { ...defaultState.userPreferences },
    pollingState: { ...defaultState.pollingState },
  };

  state.pollingState.isNewState = false;

  const expectedAlert = {
    type: 'basic',
    title: `MyService - MyEvent`,
    message: 'This is a test',
    iconUrl: 'alert.png',
    isClickable: true,
    requireInteraction: false,
    buttons: [{ title: 'Ack' }, { title: 'View alert details' }],
  };

  // @ts-ignore
  mockBrowser.notifications.create.expect('Alert_12345', expectedAlert);
  // @ts-ignore
  //mockBrowser.notifications.update.mock();
  // When
  sendNotification(state, [
    {
      id: '12345',
      service: ['MyService'],
      event: 'MyEvent',
      text: 'This is a test',
    },
  ]);
});

test('Should launch persistent notification if enabled in user preference', () => {
  // Given
  const state = {
    userPreferences: { ...defaultState.userPreferences },
    pollingState: { ...defaultState.pollingState },
  };

  state.pollingState.isNewState = false;
  state.userPreferences.persistentNotifications = true;

  const expectedAlert = {
    type: 'basic',
    title: `MyService - MyEvent`,
    message: 'This is a test',
    requireInteraction: true,
    iconUrl: 'alert.png',
    isClickable: true,
    buttons: [{ title: 'Ack' }, { title: 'View alert details' }],
  };

  // @ts-ignore
  mockBrowser.notifications.create.expect('Alert_1', expectedAlert);

  // When
  sendNotification(state, [
    {
      id: '1',
      service: ['MyService'],
      event: 'MyEvent',
      text: 'This is a test',
    },
  ]);
});

test('Should launch a list notifications is more than one new alert', () => {
  // Given
  const state = {
    userPreferences: { ...defaultState.userPreferences },
    pollingState: { ...defaultState.pollingState },
  };

  state.pollingState.isNewState = false;

  const expectedListAlert = {
    type: 'list',
    title: `2 new alerts detected !`,
    message: 'Click to open Alerta',
    items: [
      {
        message: ' ',
        title: 'MyService2 - MyEvent2',
      },
      {
        message: ' ',
        title: 'MyService3 - MyEvent3',
      },
    ],
    iconUrl: 'alert.png',
    isClickable: true,
    buttons: [{ title: 'Go to alerta' }],
    requireInteraction: false,
  };

  // @ts-ignore
  mockBrowser.notifications.create.expect('GoToAlertaHome', expectedListAlert);

  sendNotification(state, [
    {
      id: '1',
      service: ['MyService2'],
      event: 'MyEvent2',
    },
    {
      id: '2',
      service: ['MyService3'],
      event: 'MyEvent3',
    },
  ]);
});

test('Should not launch notification if no new alert', () => {
  // Given
  // Here, we do not setup any mock on Notification. Meaning that is a call is made, then the test will fail.

  const state = {
    userPreferences: { ...defaultState.userPreferences },
    pollingState: { ...defaultState.pollingState },
  };

  state.pollingState.isNewState = false;

  // when
  sendNotification(state, []);
});

test('Should not launch notification if alerts has not been fetched for the first time, or user preferences just saved', () => {
  // Given
  // Here, we do not setup any mock on Notification. Meaning that is a call is made, then the test will fail.

  const state = {
    userPreferences: { ...defaultState.userPreferences },
    pollingState: { ...defaultState.pollingState },
  };

  state.pollingState.isNewState = true;

  // When
  sendNotification(state, [
    {
      id: '1',
      service: ['MyService2'],
      event: 'MyEvent2',
    },
  ]);
});

test('Should play a sound if selected in user preferences', () => {
  // Given
  const state = {
    userPreferences: { ...defaultState.userPreferences },
    pollingState: { ...defaultState.pollingState },
  };

  state.pollingState.isNewState = false;
  state.userPreferences.playAudio = true;

  mockBrowser.notifications.create.expect;

  // when
  sendNotification(state, [
    {
      id: '1',
      service: ['MyService2'],
      event: 'MyEvent2',
    },
  ]);

  // then
  expect(playSound).toHaveBeenCalled();
});
