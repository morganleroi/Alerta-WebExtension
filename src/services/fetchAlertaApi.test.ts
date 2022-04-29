import { defaultState } from '../model/extensionState';
import { UserPreferences } from '../model/userPreferences';
import * as fetchAlerta from './fetchAlertaApi';

test('Should query alerta with defaults user preferences', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filterGroups: [],
    filterServices: [],
    filterEnvironments: [],
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
    filterGroups: ['groupeOne'],
    filterServices: [],
    filterEnvironments: [],
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
    filterGroups: ['groupeOne', 'groupTwo'],
    filterServices: [],
    filterEnvironments: [],
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual(
    'status=open&status=ack&sort-by=lastReceiveTime&group=groupeOne&group=groupTwo',
  );
});

test('Should query alerta with one service filtering', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filterGroups: [],
    filterServices: ['serviceOne'],
    filterEnvironments: [],
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
    filterGroups: [],
    filterServices: ['serviceOne', 'serviceTwo'],
    filterEnvironments: [],
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual(
    'status=open&status=ack&sort-by=lastReceiveTime&service=serviceOne&service=serviceTwo',
  );
});

test('Should query alerta with one environment filtering', () => {
  // Given
  const userPreferences: UserPreferences = {
    ...defaultState.userPreferences,
    filterGroups: [],
    filterServices: [],
    filterEnvironments: ['Production'],
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
    filterGroups: [],
    filterServices: [],
    filterEnvironments: ['Production', 'Development'],
  };

  // When
  const query = fetchAlerta.createFetchQuery(userPreferences);

  // Then
  expect(query).toEqual(
    'status=open&status=ack&sort-by=lastReceiveTime&environment=Production&environment=Development',
  );
});
