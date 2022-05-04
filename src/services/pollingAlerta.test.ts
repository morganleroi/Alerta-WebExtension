import { fetchAlerts, startPolling } from './pollingAlerta';
import fetchMock from 'jest-fetch-mock';
import { AlertaExtStore, defaultState, FetchAlertStatus } from '../model/extensionState';
import { mockEvent } from 'mockzilla-webextension';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
  mockEvent(mockBrowser.notifications.onButtonClicked);
  jest.clearAllMocks();
});

test('Should setup the alarm when start polling', () => {
  mockBrowser.alarms.onAlarm.addListener.expect;

  // @ts-ignore
  mockBrowser.alarms.create.expect('PollingAlerta', expect.anything());

  // When
  startPolling();
});

test('Should fetch Alerts when alarms is triggered', () => {
  mockBrowser.browserAction.setBadgeText.expect;
  mockBrowser.browserAction.setBadgeBackgroundColor.expect;
  // @ts-ignore
  mockBrowser.notifications.create.expect('Alert_12345', expect.anything());
  mockBrowser.storage.local.set.expect.andResolve().times(2);

  // Given
  const fetchMockAlerta = fetchMock.mockResponseOnce(
    JSON.stringify({
      alerts: [
        {
          id: '12345',
          service: ['MyService'],
          event: 'MyEvent',
          value: 'This is a test',
        },
      ],
    }),
  );

  const state = {
    fetchAlertPollingState: {
      status: FetchAlertStatus.NotYetFetched,
    },
    userPreferences: {
      ...defaultState.userPreferences,
      alertaApiServerUrl: 'https://myAlertaServer/',
      alertaApiSecret: 'MySecretKey',
    },
    pollingState: {
      alertaFetchQuery: 'service=test&group-test2',
      alerts: [],
      isNewState: false,
      fetchAlertState: { status: FetchAlertStatus.NotYetFetched },
    },
  } as AlertaExtStore;

  // When
  fetchAlerts(state);

  // Then
  expect(fetchMockAlerta.mock.calls.length).toEqual(1);
  expect(fetchMockAlerta.mock.calls[0][0]).toEqual(
    'https://myAlertaServer/alerts?service=test&group-test2',
  );

  const expectedPayload = {
    headers: {
      Authorization: 'Key MySecretKey',
    },
  };

  expect(fetchMockAlerta.mock.calls[0][1]).toEqual(expectedPayload);
});
