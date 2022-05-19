import React from 'react';
import { AlertIco } from './AlertIco';

export function ConnectionStatusInfo(props: { isSuccess: boolean; error?: { status: number; statusText: string } }) {
  return (
    <p>
      <AlertIco success={props.isSuccess} />
      {props.isSuccess ? (
        <span> Looks good ! Alerts can be retrieved from Alerta API</span>
      ) : (
        <span>
          Oups, we're not able to get alerts from Alerta API
          {props.error?.status || props.error?.statusText
            ? ` (${props.error.status} - ${props.error.statusText})`
            : ' (You need to allow the extension to call Alerta API. Please fulfill the form then Save preferences)'}
        </span>
      )}
    </p>
  );
}
