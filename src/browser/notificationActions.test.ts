import { AlertaExtStore } from '../model/extensionState';
import { ackAlert, openAlert, openAlerta } from './notificationActions';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
  jest.clearAllMocks();
});

test('Should open Alerta in a new tab when I click on an alert', async () => {
  const tabs: any = { id: 1, windowId: 2 };

  mockBrowser.tabs.create.expect({ active: true, url: 'https://myAlertaServer/ui/' }).andResolve(tabs).times(1);

  mockBrowser.windows.update.expect(2, { focused: true }).times(1);

  await openAlerta({
    userPreferences: {
      alerta: {
        uiUrl: 'https://myAlertaServer/ui/',
      },
    },
  } as AlertaExtStore);
});

test('Should open a specific alert in a new tab and clear the notification', () => {
  const tabs: any = { id: 1, windowId: 2 };

  mockBrowser.tabs.create
    .expect({
      active: true,
      url: 'https://myAlertaServer/ui/alert/1324657',
    })
    .andResolve(tabs)
    .times(1);

  mockBrowser.notifications.clear.expect('myNodifId');

  mockBrowser.windows.update.expect(2, { focused: true });

  openAlert(
    {
      userPreferences: {
        alerta: {
          uiUrl: 'https://myAlertaServer/ui/',
        },
      },
    } as AlertaExtStore,
    'myNodifId',
    '1324657',
  );
});

test('Should ack the alert in Alerta and close the notification when clicking on Ack button', () => {
  // Given
  const state = {
    userPreferences: {
      username: 'Morgan',
      alerta: {
        apiUrl: 'https://myAlertaServer/api/',
        apiSecret: 'SecretKey',
      },
    },
  } as AlertaExtStore;

  const fetchMockAlerta = fetchMock.mockOnce('');

  mockBrowser.notifications.clear.expect('MyNotifId');

  // When
  ackAlert(state, 'MyNotifId', '1324');

  // Then
  expect(fetchMockAlerta.mock.calls.length).toEqual(1);
  expect(fetchMockAlerta.mock.calls[0][0]).toEqual('https://myAlertaServer/api/alert/1324/status');

  const expectedPayload = {
    body: JSON.stringify({
      status: 'ack',
      text: "Morgan: I'll take a look ...",
    }),
    headers: {
      Authorization: 'Key SecretKey',
      'Content-type': 'application/json',
    },
    method: 'PUT',
  };

  expect(fetchMockAlerta.mock.calls[0][1]).toEqual(expectedPayload);
});
