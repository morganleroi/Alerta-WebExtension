import React, { useEffect, useState } from 'react';
import { FetchAlertState } from '../model/extensionState';
import { ConnectionStatusInfo } from './ConnectionStatusInfo';

const ConnectionStatus = (props: { fetchAlertStatus: FetchAlertState }) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<{ status: number; statusText: string }>();
  useEffect(() => {
    setIsSuccess(props.fetchAlertStatus.status === 'OK');
    setError(props.fetchAlertStatus?.error);
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.fetchAlertPollingState?.newValue) {
        setIsSuccess(changes.fetchAlertPollingState?.newValue.status === 'OK');
        setError(changes.fetchAlertPollingState?.newValue.error);
      }
    });
  }, []);

  return <ConnectionStatusInfo isSuccess={isSuccess} error={error} />;
};

export default ConnectionStatus;
