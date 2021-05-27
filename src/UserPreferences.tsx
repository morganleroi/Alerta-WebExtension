import * as React from "react";
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { AlertaExtStore } from "./Model/AlertaExtStore";
import { UserPreferences } from './Model/UserPreferences'

const UserPreferences = () => {
    const [userPref, setUserPref] = React.useState<UserPreferences>({
        AlertaApiServerUrl: "",
        AlertaUiUrl: "",
        PersistentNotifications: false,
        ShowNotifications: true,
        AlertaApiSecret: "",
        username: ""
    });
    const [userPrefSaved, setUserPrefSaved] = React.useState(false);

    React.useEffect(() => {
        chrome.storage.sync.get(null, function (items: any) {
            const alertaExtStore: AlertaExtStore = items;
            setUserPref(alertaExtStore.userPreferences);
        });
    }, []);

    const saveUserPreference = () => {

        if(userPref.AlertaApiServerUrl.endsWith('/')){
            userPref.AlertaApiServerUrl = userPref.AlertaApiServerUrl.slice(0, userPref.AlertaApiServerUrl.length - 1).trim();
        }

        if(userPref.AlertaUiUrl.endsWith('/')){
            userPref.AlertaUiUrl = userPref.AlertaUiUrl.slice(0, userPref.AlertaUiUrl.length - 1).trim();
        }

        chrome.storage.sync.get(null, function (items: any) {
            const alertaExtStore: AlertaExtStore = items;
            const newState: AlertaExtStore = {
                ...alertaExtStore,
                userPreferences: userPref
            };
            chrome.storage.sync.set(newState);
            setUserPrefSaved(true);
            setTimeout(() => setUserPrefSaved(false), 5000);
        });
    }

    return (
        <div className="container-fluid">
            <Form>
                <div className="alert alert-success" id="saveSucess" role="alert" style={{ display: userPrefSaved ? 'block' : 'none' }} >
                    Preferences saved !
                </div>
                <FormGroup className="mb-3">
                    <label htmlFor="alertaUrl" className="form-label">Alerta API Url</label>
                    <input type="text" className="form-control" id="alertaUrl"
                        placeholder="http://hostname:port" value={userPref?.AlertaApiServerUrl} onChange={(val) => setUserPref({ ...userPref, AlertaApiServerUrl: val.target.value })} />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label htmlFor="alertaUiUrl" className="form-label">Alerta UI Url</label>
                    <input type="text" className="form-control" id="alertaUiUrl"
                        placeholder="http://hostname:port" value={userPref?.AlertaUiUrl} onChange={(val) => setUserPref({ ...userPref, AlertaUiUrl: val.target.value })} />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label htmlFor="alertaSecretKey" className="form-label">Alerta API Secret</label>
                    <input type="text" className="form-control" id="alertaSecretKey"
                        placeholder="" value={userPref?.AlertaApiSecret} onChange={(val) => setUserPref({ ...userPref, AlertaApiSecret: val.target.value })} />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="text" className="form-control" id="username"
                        placeholder="Your mail, or you name." value={userPref?.username} onChange={(val) => setUserPref({ ...userPref, username: val.target.value })} />
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="checkbox" checked={userPref?.ShowNotifications} onChange={(val) => setUserPref({ ...userPref, ShowNotifications: val.target.checked })} />
                        Generates Chrome (or OS) notifications
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="checkbox" checked={userPref?.PersistentNotifications} onChange={(val) => setUserPref({ ...userPref, PersistentNotifications: val.target.checked })} />
                        Persistant notifications
                    </Label>
                </FormGroup>
                <Button color="primary" onClick={saveUserPreference}>Save preferences</Button>
            </Form>
        </div>
    );
};

export default UserPreferences