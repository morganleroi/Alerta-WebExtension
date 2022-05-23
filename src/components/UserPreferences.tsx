import React, { useEffect, useState } from 'react';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { defaultState, FetchAlertStatus } from '../model/extensionState';
import { UserPreferences } from '../model/userPreferences';
import * as alertaApi from '../services/fetchAlertaApi';
import Filter from './Filter';
import InfoTooltip from './InfoTooltip';
import ConnectionStatus from './ConnectionStatus';
import { PermissionBanner } from './PermissionBanner';
import { cleanUrl } from '../services/Utils';
import { AlertaEvent, dispatchAndSave } from '../services/stateReducers';
import { loadState } from '../browser/storage';

type AlertaFilter = {
  label: string;
  value: string;
};

const UserPreferences = () => {
  const [userPref, setUserPref] = useState<UserPreferences>(defaultState.userPreferences);
  const [fetchAlertStatus, setFetchAlertStatus] = useState<FetchAlertStatus>(defaultState.pollingState.status);
  const [userPrefSaved, setUserPrefSaved] = useState<{
    userPrefSavedWithoutError: boolean;
    displayAlert: boolean;
    errorReason?: string;
  }>();
  const [selectedOptionGroup, setSelectedOptionGroup] = useState<AlertaFilter[]>([]);
  const [selectedOptionEnvironment, setSelectedOptionEnvironment] = useState<AlertaFilter[]>([]);
  const [selectedOptionService, setSelectedOptionService] = useState<AlertaFilter[]>([]);
  const [isUserPrefLoaded, setIsUserPrefLoaded] = useState<boolean>();

  useEffect(() => {
    const reloadState = async () => {
      const alertaExtStore = await loadState();
      setUserPref(alertaExtStore.userPreferences);
      setFetchAlertStatus(alertaExtStore.pollingState.status);
      setIsUserPrefLoaded(true);
    };

    reloadState();
  }, []);

  const saveUserPreference = () => {
    userPref.alerta.apiUrl = cleanUrl(userPref.alerta.apiUrl);
    userPref.alerta.uiUrl = cleanUrl(userPref.alerta.uiUrl);

    userPref.filters.services = selectedOptionService.map(option => option.value);
    userPref.filters.groups = selectedOptionGroup.map(option => option.value);
    userPref.filters.environments = selectedOptionEnvironment.map(option => option.value);

    dispatchAndSave({ event: AlertaEvent.SAVE_USER_PREFERENCES, payload: userPref })
      .then(_ => {
        setUserPrefSaved({
          userPrefSavedWithoutError: true,
          displayAlert: true,
        });
        setTimeout(
          () =>
            setUserPrefSaved({
              userPrefSavedWithoutError: true,
              displayAlert: false,
            }),
          5000,
        );
      })
      .catch(reason => {
        setUserPrefSaved({
          userPrefSavedWithoutError: false,
          displayAlert: true,
          errorReason: reason,
        });
      });
  };

  return (
    <div className="container-fluid">
      {isUserPrefLoaded && <PermissionBanner userPref={userPref} />}
      <Form>
        <div
          className={userPrefSaved?.userPrefSavedWithoutError ? 'alert alert-success m-3' : 'alert alert-danger m-3'}
          role="alert"
          style={{ display: userPrefSaved?.displayAlert ? 'block' : 'none' }}
        >
          {userPrefSaved?.userPrefSavedWithoutError ? 'Preferences saved !' : 'Oups, an error happened while saving preferences. (Error: ' + userPrefSaved?.errorReason + ')'}
        </div>

        <div className="card mt-2">
          <div className="card-header">
            <h4>Alerta Server configuration</h4>
            {fetchAlertStatus && isUserPrefLoaded && <ConnectionStatus fetchAlertStatus={fetchAlertStatus} />}
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-left">
              <div className="m-2 flex-fill">
                <label htmlFor="alertaUrl" className="form-label">
                  Alerta API Url <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="alertaUrl"
                  placeholder="https://hostname:port"
                  value={userPref?.alerta.apiUrl}
                  onChange={val =>
                    setUserPref({
                      ...userPref,
                      alerta: {
                        ...userPref.alerta,
                        apiUrl: val.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="m-2 flex-fill">
                <label htmlFor="alertaSecretKey" className="form-label">
                  Alerta API Secret
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="alertaSecretKey"
                  placeholder=""
                  value={userPref?.alerta.apiSecret}
                  onChange={val =>
                    setUserPref({
                      ...userPref,
                      alerta: {
                        ...userPref.alerta,
                        apiSecret: val.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="m-2 flex-fill">
                <label htmlFor="alertaUiUrl" className="form-label">
                  Alerta UI Url{' '}
                </label>{' '}
                <InfoTooltip id="tooltip-alerta-ui" text="This URL is used when you click on a notification to redirect to alert page" />
                <input
                  type="text"
                  className="form-control"
                  id="alertaUiUrl"
                  placeholder="https://hostname:port"
                  value={userPref?.alerta.uiUrl}
                  onChange={val =>
                    setUserPref({
                      ...userPref,
                      alerta: {
                        ...userPref.alerta,
                        uiUrl: val.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="m-2 flex-fill">
                <label htmlFor="username" className="form-label">
                  Username
                </label>{' '}
                <InfoTooltip id="tooltip-username" text="Username if used when you Ack the alert notification" />
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Your mail, or you name."
                  value={userPref?.username}
                  onChange={val => setUserPref({ ...userPref, username: val.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex flex-wrap">
          <div className="card mt-2 me-4">
            <div className="card-header">
              <h4>Extension user preferences</h4>
            </div>
            <div className="card-body">
              <FormGroup className="m-2" check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={userPref?.notification.showNotifications}
                    onChange={val =>
                      setUserPref({
                        ...userPref,
                        notification: {
                          ...userPref.notification,
                          showNotifications: val.target.checked,
                        },
                      })
                    }
                  />
                  Display a notification when a new alert is received
                </Label>
              </FormGroup>
              <FormGroup className="m-2" check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={userPref?.notification.persistentNotifications}
                    onChange={val =>
                      setUserPref({
                        ...userPref,
                        notification: {
                          ...userPref.notification,
                          persistentNotifications: val.target.checked,
                        },
                      })
                    }
                  />
                  Persistent notifications <InfoTooltip id="tooltip-persistant-notif" text="Notifications will not disapears until you click on them (Or any action)" />
                </Label>
              </FormGroup>
              <FormGroup className="m-2" check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={userPref?.notification.playAudio}
                    onChange={val =>
                      setUserPref({
                        ...userPref,
                        notification: {
                          ...userPref.notification,
                          playAudio: val.target.checked,
                        },
                      })
                    }
                  />
                  Play a "Bip" when a new alert is received
                </Label>
              </FormGroup>
            </div>
          </div>

          <div className="card mt-2 flex-grow-1">
            <div className="card-header">
              <h4>Filters</h4>
            </div>
            {isUserPrefLoaded && (
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-left">
                  <Filter
                    globalStatus={fetchAlertStatus!}
                    name="Environments"
                    userPref={userPref}
                    getFilterValues={alertaApi.getEnvironments}
                    getUserPrefFilterValues={userPref.filters.environments}
                    onSelectedFilter={setSelectedOptionEnvironment}
                    selectedFilterValue={selectedOptionEnvironment}
                  />
                  <Filter
                    globalStatus={fetchAlertStatus!}
                    name="Services"
                    userPref={userPref}
                    getFilterValues={alertaApi.getServices}
                    getUserPrefFilterValues={userPref.filters.services}
                    onSelectedFilter={setSelectedOptionService}
                    selectedFilterValue={selectedOptionService}
                  />
                  <Filter
                    globalStatus={fetchAlertStatus!}
                    name="Groups"
                    userPref={userPref}
                    getFilterValues={alertaApi.getGroups}
                    getUserPrefFilterValues={userPref.filters.groups}
                    onSelectedFilter={setSelectedOptionGroup}
                    selectedFilterValue={selectedOptionGroup}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <Button className="mt-5" color="primary" onClick={saveUserPreference}>
          Save preferences
        </Button>
      </Form>
    </div>
  );
};

export default UserPreferences;
