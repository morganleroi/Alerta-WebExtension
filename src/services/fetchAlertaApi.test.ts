import { defaultState } from '../model/extensionState';
import { UserPreferences } from '../model/userPreferences';
import * as fetchAlerta from './fetchAlertaApi';

test('Should query alerta with defaults user preferences', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filters: {
      groups: [],
      services: [],
      environments: [],
    },
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual('status=open&status=ack&sort-by=lastReceiveTime');
});

test('Should query alerta with one group filtering', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filters: {
      groups: ['groupeOne'],
      services: [],
      environments: [],
    },
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual('status=open&status=ack&sort-by=lastReceiveTime&group=groupeOne');
});

test('Should query alerta with multiple groups filtering', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filters: {
      groups: ['groupeOne', 'groupTwo'],
      services: [],
      environments: [],
    },
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual('status=open&status=ack&sort-by=lastReceiveTime&group=groupeOne&group=groupTwo');
});

test('Should query alerta with one service filtering', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filters: {
      groups: [],
      services: ['serviceOne'],
      environments: [],
    },
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual('status=open&status=ack&sort-by=lastReceiveTime&service=serviceOne');
});

test('Should query alerta with multiple services filtering', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filters: {
      groups: [],
      services: ['serviceOne', 'serviceTwo'],
      environments: [],
    },
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual('status=open&status=ack&sort-by=lastReceiveTime&service=serviceOne&service=serviceTwo');
});

test('Should query alerta with one environment filtering', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filters: {
      groups: [],
      services: [],
      environments: ['Production'],
    },
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual('status=open&status=ack&sort-by=lastReceiveTime&environment=Production');
});

test('Should query alerta with multiple environments filtering', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filters: {
      groups: [],
      services: [],
      environments: ['Production', 'Development'],
    },
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual('status=open&status=ack&sort-by=lastReceiveTime&environment=Production&environment=Development');
});
