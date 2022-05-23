import React, { useEffect, useState } from 'react';
import { FetchAlertStatus, FetchAlertStatusResult } from '../model/extensionState';
import { ConnectionStatusInfo } from './ConnectionStatusInfo';
import browser from 'webextension-polyfill';

const ConnectionStatus = (props: { fetchAlertStatus: FetchAlertStatus }) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<{ status: number; statusText: string }>();
  useEffect(() => {
    setIsSuccess(props.fetchAlertStatus.result === FetchAlertStatusResult.OK);
    setError(props.fetchAlertStatus?.error);
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.pollingState?.newValue.status.result) {
        setIsSuccess(changes.pollingState?.newValue.status.result === FetchAlertStatusResult.OK);
        setError(changes.pollingState?.newValue.status.result.error);
      }
    });
  }, []);

  return <ConnectionStatusInfo isSuccess={isSuccess} error={error} />;
};

export default ConnectionStatus;
