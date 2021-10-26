import * as React from "react";
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { AlertaExtStore } from "../model/extensionState";
import { UserPreferences } from '../model/userPreferences';
import CreatableSelect from 'react-select/creatable'

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
        filterServices: [],
        playAudio: false,
    });
    const [userPrefSaved, setUserPrefSaved] = React.useState(false);
    const [alertaServices, setAlertaServices] = React.useState<{ value: string, label: string }[]>([]);
    const [alertaGroup, setAlertaGroups] = React.useState<{ value: string, label: string }[]>([]);
    const [selectedOptionGroup, setSelectedOptionGroup] = React.useState<AlertaFilter[]>([]);
    const [selectedOptionService, setSelectedOptionService] = React.useState<AlertaFilter[]>([]);

    React.useEffect(() =>
        chrome.storage.local.get(null, function (items: any) {
            const alertaExtStore: AlertaExtStore = items;
            setUserPref(alertaExtStore.userPreferences);
            fetch(`${alertaExtStore.userPreferences.alertaApiServerUrl}/services`, { method: "GET", headers: { "Content-type": "application/json", 'Authorization': `Key ${alertaExtStore.userPreferences.alertaApiSecret}` } })
                .then(response => response.json())
                .then(reponse => {
                    var services: { value: string, label: string }[] = reponse.services.map((x: any) => {
                        return { label: x.service, value: x.service }
                    });
                    setAlertaServices(services);
                });

            fetch(`${alertaExtStore.userPreferences.alertaApiServerUrl}/alerts/groups`, { method: "GET", headers: { "Content-type": "application/json", 'Authorization': `Key ${alertaExtStore.userPreferences.alertaApiSecret}` } })
                .then(response => response.json())
                .then(reponse => {
                    var groups: { value: string, label: string }[] = reponse.groups.map((x: any) => {
                        return { label: x.group, value: x.group }
                    });
                    setAlertaGroups(groups);
                });
        }), []);


    React.useEffect(() => {
        chrome.storage.local.get(null, function (items: any) {
            const alertaExtStore: AlertaExtStore = items;
            setUserPref(alertaExtStore.userPreferences);
            setSelectedOptionService(alertaExtStore.userPreferences.filterServices.map(s => {
                return { value: s, label: s }
            }));
            setSelectedOptionGroup(alertaExtStore.userPreferences.filterGroups.map(s => {
                return { value: s, label: s }
            }));
        });
    }, []);

    const saveUserPreference = () => {
        if (userPref.alertaApiServerUrl.endsWith('/')) {
            userPref.alertaApiServerUrl = userPref.alertaApiServerUrl.slice(0, userPref.alertaApiServerUrl.length - 1).trim();
        }
        if (userPref.alertaUiUrl.endsWith('/')) {
            userPref.alertaUiUrl = userPref.alertaUiUrl.slice(0, userPref.alertaUiUrl.length - 1).trim();
        }
        userPref.filterServices = selectedOptionService.map(option => option.value);
        userPref.filterGroups = selectedOptionGroup.map(option => option.value);
        
        chrome.permissions.contains({
            origins: [userPref.alertaApiServerUrl + "/"]
        }, isAlertaAllowed => {
            if (!isAlertaAllowed) {
                chrome.permissions.request({
                    origins: [userPref.alertaApiServerUrl + "/"]
                }, function () {});
            }
        });

        chrome.storage.local.get(null, function (items: any) {
            const alertaExtStore: AlertaExtStore = items;
            const newState: AlertaExtStore = {
                ...alertaExtStore,
                pollingState: {
                    ...alertaExtStore.pollingState,
                    alertaFetchQuery: "environment=Production&status=open&status=ack&sort-by=lastReceiveTime" + createFetchQuery(userPref.filterServices, userPref.filterGroups)
                },
                userPreferences: userPref
            };
            chrome.storage.local.set(newState);
            setUserPrefSaved(true);
            setTimeout(() => setUserPrefSaved(false), 5000);
        });
    }

    function createFetchQuery(services: string[], groups: string[]) {
        let groupQuery: string = "";
        if (groups.length > 0) {
            const reducer = (accumulator: string, currentValue: string) => accumulator + `&group=${currentValue}`;
            groupQuery = groups.reduce(reducer, groupQuery);
        }
    
        let serviceQuery: string = "";
        if (services.length > 0) {
            const reducer = (accumulator: string, currentValue: string) => accumulator + `&service=${currentValue}`;
            serviceQuery = services.reduce(reducer, serviceQuery);
        }
    
        return serviceQuery + groupQuery;
    }

    return (
        <div className="container-fluid">
            <h1>Alerta Extension Options</h1>
            <Form>
                <div className="alert alert-success" id="saveSucess" role="alert" style={{ display: userPrefSaved ? 'block' : 'none' }} >
                    Preferences saved !
                </div>
                <FormGroup className="mb-3">
                    <label htmlFor="alertaUrl" className="form-label">Alerta API Url</label>
                    <input type="text" className="form-control" id="alertaUrl"
                        placeholder="http://hostname:port" value={userPref?.alertaApiServerUrl} onChange={(val) => setUserPref({ ...userPref, alertaApiServerUrl: val.target.value })} />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label htmlFor="alertaUiUrl" className="form-label">Alerta UI Url</label>
                    <input type="text" className="form-control" id="alertaUiUrl"
                        placeholder="http://hostname:port" value={userPref?.alertaUiUrl} onChange={(val) => setUserPref({ ...userPref, alertaUiUrl: val.target.value })} />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label htmlFor="alertaSecretKey" className="form-label">Alerta API Secret</label>
                    <input type="text" className="form-control" id="alertaSecretKey"
                        placeholder="" value={userPref?.alertaApiSecret} onChange={(val) => setUserPref({ ...userPref, alertaApiSecret: val.target.value })} />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="text" className="form-control" id="username"
                        placeholder="Your mail, or you name." value={userPref?.username} onChange={(val) => setUserPref({ ...userPref, username: val.target.value })} />
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="checkbox" checked={userPref?.showNotifications} onChange={(val) => setUserPref({ ...userPref, showNotifications: val.target.checked })} />
                        Generates Chrome (or OS) notifications
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="checkbox" checked={userPref?.persistentNotifications} onChange={(val) => setUserPref({ ...userPref, persistentNotifications: val.target.checked })} />
                        Persistant notifications
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="checkbox" checked={userPref?.playAudio} onChange={(val) => setUserPref({ ...userPref, playAudio: val.target.checked })} />
                        Play a "Bip" with a new notification
                    </Label>
                </FormGroup>
                <FormGroup className="mb-3">
                    <label htmlFor="alertaServices" className="form-label">Filter Services</label>
                    <CreatableSelect isMulti options={alertaServices} onChange={setSelectedOptionService as any} value={selectedOptionService} defaultValue={selectedOptionService} />
                </FormGroup>
                <FormGroup className="mb-3">
                    <label htmlFor="alertaGroup" className="form-label">Filter Groups</label>
                    <CreatableSelect isMulti options={alertaGroup} onChange={setSelectedOptionGroup as any} value={selectedOptionGroup} defaultValue={selectedOptionGroup} />
                </FormGroup>

                <Button color="primary" onClick={saveUserPreference}>Save preferences</Button>
            </Form>
        </div>
    );
};

export default UserPreferences