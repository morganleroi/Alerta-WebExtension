import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FormGroup } from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import { UserPreferences } from '../model/userPreferences';
import { FetchAlertStatus } from '../model/extensionState';

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
  globalStatus: FetchAlertStatus;
};

const distinctAndPrepareForCombobox = (values: string[]) => {
  return Array.from(new Set(values)).map((x: any) => {
    return { label: x, value: x };
  });
};

const Filter = (props: FilterProps) => {
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
          return;
        }
        setFilterValues(distinctAndPrepareForCombobox(response));
      })
      .catch(() => {});
  }, [props.userPref.alerta.apiSecret, props.userPref.alerta.apiUrl, props.globalStatus.result]);

  return (
    <FormGroup className="m-2 flex-fill">
      <label htmlFor="alertaServices" className="form-label">
        {props.name}
      </label>
      <CreatableSelect isMulti options={filterValues} onChange={props.onSelectedFilter as any} value={props.selectedFilterValue} defaultValue={props.selectedFilterValue} />
    </FormGroup>
  );
};

export default Filter;
