import React, { useEffect, useState } from 'react';
import { FormGroup } from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import { UserPreferences } from '../model/userPreferences';
import { FetchAlertState } from '../model/extensionState';

type AlertaFilter = {
  label: string;
  value: string;
};

type FilterProps = {
  name: string;
  userPref: UserPreferences;
  getFilterValues: (userPref: UserPreferences) => Promise<any>;
  getUserPrefFilterValues: string[];
  onSelectedFilter: React.Dispatch<
    React.SetStateAction<
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
  const [isFilterFetched, setIsFilterFetched] = useState<boolean>();
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
        setIsFilterFetched(props.globalStatus.status === 'OK');
      })
      .catch(() => {
        setIsFilterFetched(false);
      });
  }, [
    props.userPref.alertaApiSecret,
    props.userPref.alertaApiServerUrl,
    props.globalStatus.status,
  ]);

  return (
    <FormGroup className="m-2 flex-fill">
      <label htmlFor="alertaServices" className="form-label">
        {props.name}{' '}
        {isFilterFetched ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-check-circle-fill text-success"
            viewBox="0 0 16 16"
          >
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-exclamation-circle-fill text-danger"
            viewBox="0 0 16 16"
          >
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
          </svg>
        )}
      </label>
      <CreatableSelect
        isMulti
        options={filterValues}
        onChange={props.onSelectedFilter as any}
        value={props.selectedFilterValue}
        defaultValue={props.selectedFilterValue}
      />
    </FormGroup>
  );
};

export default Filter;
