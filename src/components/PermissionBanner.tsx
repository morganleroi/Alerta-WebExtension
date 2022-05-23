import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import { UserPreferences } from '../model/userPreferences';
import { cleanUrl } from '../services/Utils';
import { acceptPermission } from '../browser/permission';

export const PermissionBanner = (props: { userPref: UserPreferences }) => {
  const [permissionIsOk, setPermissionIsOk] = useState<boolean>(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      const permissionsAlreadyOk = await browser.permissions.contains({
        origins: ['*://*/*'],
      });
      setPermissionIsOk(permissionsAlreadyOk);
    };

    fetchPermissions().catch(console.log);
  }, []);

  return !permissionIsOk ? (
    <div>
      <div className="alert alert-danger m-3" role="alert">
        <p>
          Extension is not able to make calls to Alerta because "<i>{cleanUrl(props.userPref.alerta.apiUrl)}</i>" is not yet allowed. Please click on the button bellow to allow the extensions to
          access Alerta API.
        </p>
        <div>
          <button type="button" className="btn btn-light" value="Accept" onClick={() => acceptPermission().then(setPermissionIsOk)}>
            Allow this extension to call Alerta API
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div />
  );
};
