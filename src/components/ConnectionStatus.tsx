import React, { useEffect, useState } from 'react';
import { FetchAlertState, FetchAlertStatus } from '../model/extensionState';
import { ConnectionStatusInfo } from './ConnectionStatusInfo';
import browser from 'webextension-polyfill';

const ConnectionStatus = (props: { fetchAlertStatus: FetchAlertState }) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<{ status: number; statusText: string }>();
  useEffect(() => {
    setIsSuccess(props.fetchAlertStatus.status === FetchAlertStatus.OK);
    setError(props.fetchAlertStatus?.error);
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.fetchAlertPollingState?.newValue) {
        setIsSuccess(changes.fetchAlertPollingState?.newValue.status === FetchAlertStatus.OK);
        setError(changes.fetchAlertPollingState?.newValue.error);
      }
    });
  }, []);

  return <ConnectionStatusInfo isSuccess={isSuccess} error={error} />;
};

export default ConnectionStatus;
