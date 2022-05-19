import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FormGroup } from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import { UserPreferences } from '../model/userPreferences';
import { FetchAlertState, FetchAlertStatus } from '../model/extensionState';
import { AlertIco } from './AlertIco';

type AlertaFilter = {
  label: string;
  value: string;
};

type FilterProps = {
  name: string;
  userPref: UserPreferences;
  getFilterValues: (userPref: UserPreferences) => Promise<any>;
  getUserPrefFilterValues: string[];
  onSelectedFilter: Dispatch<
    SetStateAction<
      {
        value: string;
        label: string;
      }[]
    >
  >;
  selectedFilterValue: AlertaFilter[];
  globalStatus: FetchAlertState;
};

const distinctAndPrepareForCombobox = (values: string[]) => {
  return Array.from(new Set(values)).map((x: any) => {
    return { label: x, value: x };
  });
};

const Filter = (props: FilterProps) => {
  const [isFilterFetched, setIsFilterFetched] = useState<boolean>(false);
  const [filterValues, setFilterValues] = useState<AlertaFilter[]>([]);

  useEffect(() => {
    props.onSelectedFilter(
      props.getUserPrefFilterValues.map(s => {
        return { value: s, label: s };
      }),
    );

    props
      .getFilterValues(props.userPref)
      .then(response => {
        if (!response) {
          setIsFilterFetched(false);
          return;
        }
        setFilterValues(distinctAndPrepareForCombobox(response));
        setIsFilterFetched(props.globalStatus.status === FetchAlertStatus.OK);
      })
      .catch(() => {
        setIsFilterFetched(false);
      });
  }, [props.userPref.alertaApiSecret, props.userPref.alertaApiServerUrl, props.globalStatus.status]);

  return (
    <FormGroup className="m-2 flex-fill">
      <label htmlFor="alertaServices" className="form-label">
        {props.name} <AlertIco success={isFilterFetched} />
      </label>
      <CreatableSelect isMulti options={filterValues} onChange={props.onSelectedFilter as any} value={props.selectedFilterValue} defaultValue={props.selectedFilterValue} />
    </FormGroup>
  );
};

export default Filter;
