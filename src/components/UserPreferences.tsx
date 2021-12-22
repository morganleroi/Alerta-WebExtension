import * as React from "react";
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { AlertaExtStore, FetchAlertState } from "../model/extensionState";
import { UserPreferences } from '../model/userPreferences';
import * as alertaApi from "../services/fetchAlertaApi";
import * as chromium from "../services/chromiumWrapper";
import Filter from "./Filter";
import InfoTooltip from "./InfoTooltip";
import ConnectionStatus from "./ConnectionStatus";

type AlertaFilter = {
    label: string,
    value: string
}

const UserPreferences = () => {
    const [userPref, setUserPref] = React.useState<UserPreferences>({
        alertaApiServerUrl: "",
        alertaUiUrl: "",
        persistentNotifications: false,
        showNotifications: true,
        alertaApiSecret: "",
        username: "",
        filterGroups: [],
        filterEnvironments: ["Production"],
        filterServices: [],
        playAudio: false,
    });
    const [fetchAlertStatus, setfetchAlertStatus] = React.useState<any>();
    const [userPrefSaved, setUserPrefSaved] = React.useState<{ userPrefSavedWithoutError: boolean, displayAlert: boolean, errorReason?: string }>();
    const [selectedOptionGroup, setSelectedOptionGroup] = React.useState<AlertaFilter[]>([]);
    const [selectedOptionEnvironment, setSelectedOptionEnvironment] = React.useState<AlertaFilter[]>([]);
    const [selectedOptionService, setSelectedOptionService] = React.useState<AlertaFilter[]>([]);
    const [isUserPrefLoaded, setIsUserPrefLoaded] = React.useState<boolean>();

    React.useEffect(() =>
        chrome.storage.local.get(null, function (items: any) {
            const alertaExtStore: AlertaExtStore = items;
            setUserPref(alertaExtStore.userPreferences);
            setfetchAlertStatus(alertaExtStore.pollingState.fetchAlertState);
            setIsUserPrefLoaded(true);
        }), []);

    const cleanUrl = (url: string) => { 
        url = url.trim();
        if (!url.endsWith('/')) {
            url = url + "/";
        }
        return url;
    }

    const saveUserPreference = () => {
        userPref.alertaApiServerUrl = cleanUrl(userPref.alertaApiServerUrl);
        userPref.alertaUiUrl = cleanUrl(userPref.alertaUiUrl);

        userPref.filterServices = selectedOptionService.map(option => option.value);
        userPref.filterGroups = selectedOptionGroup.map(option => option.value);
        userPref.filterEnvironments = selectedOptionEnvironment.map(option => option.value);

        chromium.askForPermissionIfNeeded(userPref);

        chromium.saveUserPreferences(userPref).then(_ => {
            setUserPrefSaved({ userPrefSavedWithoutError: true, displayAlert: true });
            setTimeout(() => setUserPrefSaved({ userPrefSavedWithoutError: true, displayAlert: false }), 5000);
        }).catch(reason => {
            setUserPrefSaved({ userPrefSavedWithoutError: false, displayAlert: true, errorReason: reason });
        });
    }

    return (
        <div className="container-fluid">
            <Form>
                <div className={userPrefSaved?.userPrefSavedWithoutError ? "alert alert-success m-3" : "alert alert-danger m-3"} role="alert" style={{ display: userPrefSaved?.displayAlert ? 'block' : 'none' }} >
                    {userPrefSaved?.userPrefSavedWithoutError ? "Preferences saved !" : "Oups, an error happened while saving preferences. (Error: " + userPrefSaved?.errorReason + ")"}
                </div>

                <div className="card mt-2">
                    <div className="card-header">
                        <h4>Alerta Server configuration</h4>
                        <ConnectionStatus fetchAlertStatus={fetchAlertStatus}/> 
                    </div>
                    <div className="card-body">
                        <div className="d-flex flex-wrap justify-content-left">
                            <div className="m-2 flex-fill">
                                <label htmlFor="alertaUrl" className="form-label">Alerta API Url <span className="text-danger" >*</span></label>
                                <input type="text" className="form-control" id="alertaUrl"
                                    placeholder="http://hostname:port" value={userPref?.alertaApiServerUrl}
                                    onChange={(val) => setUserPref({ ...userPref, alertaApiServerUrl: val.target.value })} />
                            </div>
                            <div className="m-2 flex-fill">
                                <label htmlFor="alertaSecretKey" className="form-label">Alerta API Secret</label>
                                <input type="text" className="form-control" id="alertaSecretKey"
                                    placeholder="" value={userPref?.alertaApiSecret}
                                    onChange={(val) => setUserPref({ ...userPref, alertaApiSecret: val.target.value })} />
                            </div>
                            <div className="m-2 flex-fill">
                                <label htmlFor="alertaUiUrl" className="form-label">Alerta UI Url </label> <InfoTooltip id="tooltip-alerta-ui" text="This URL is used when you click on a notification to redirect to alert page" />
                                <input type="text" className="form-control" id="alertaUiUrl"
                                    placeholder="http://hostname:port" value={userPref?.alertaUiUrl}
                                    onChange={(val) => setUserPref({ ...userPref, alertaUiUrl: val.target.value })} />
                            </div>
                            <div className="m-2 flex-fill">
                                <label htmlFor="username" className="form-label">Username</label> <InfoTooltip id="tooltip-username" text="Username if used when you Ack the alert notification" />
                                <input type="text" className="form-control" id="username"
                                    placeholder="Your mail, or you name." value={userPref?.username}
                                    onChange={(val) => setUserPref({ ...userPref, username: val.target.value })} />
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
                                    <Input type="checkbox" checked={userPref?.showNotifications}
                                        onChange={(val) => setUserPref({ ...userPref, showNotifications: val.target.checked })} />
                                    Display a notification when a new alert is received
                                </Label>
                            </FormGroup>
                            <FormGroup className="m-2" check>
                                <Label check>
                                    <Input type="checkbox" checked={userPref?.persistentNotifications}
                                        onChange={(val) => setUserPref({ ...userPref, persistentNotifications: val.target.checked })} />
                                    Persistent notifications <InfoTooltip id="tooltip-persistant-notif" text="Notifications will not disapears until you click on them (Or any action)" />
                                </Label>
                            </FormGroup>
                            <FormGroup className="m-2" check>
                                <Label check>
                                    <Input type="checkbox" checked={userPref?.playAudio}
                                        onChange={(val) => setUserPref({ ...userPref, playAudio: val.target.checked })} />
                                    Play a "Bip" when a new alert is received
                                </Label>
                            </FormGroup>
                        </div>
                    </div>

                    <div className="card mt-2 flex-grow-1">
                        <div className="card-header">
                            <h4>Filters</h4>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-wrap justify-content-left">
                                {isUserPrefLoaded && <Filter name="Environments" userPref={userPref} getFilterValues={alertaApi.getEnvironments} getUserPrefFilterValues={userPref.filterEnvironments} onSelectedFilter={setSelectedOptionEnvironment} selectedFilterValue={selectedOptionEnvironment} />}
                                {isUserPrefLoaded && <Filter name="Services" userPref={userPref} getFilterValues={alertaApi.getServices} getUserPrefFilterValues={userPref.filterServices} onSelectedFilter={setSelectedOptionService} selectedFilterValue={selectedOptionService} />}
                                {isUserPrefLoaded && <Filter name="Groups" userPref={userPref} getFilterValues={alertaApi.getGroups} getUserPrefFilterValues={userPref.filterGroups} onSelectedFilter={setSelectedOptionGroup} selectedFilterValue={selectedOptionGroup} />}
                            </div>
                        </div>
                    </div>
                </div>
                <Button className="mt-5" color="primary" onClick={saveUserPreference}>Save preferences</Button>
            </Form>
        </div>
    );
};

export default UserPreferences
