import React from 'react';

import {FilterField, FilterValue, ReactSelectOption, IssueMetadata, IssueType} from 'types/model';

import ChannelSettingsFilter, {EmptyChannelSettingsFilter} from './channel_settings_filter';

type ChannelSettingsFiltersProps = {
    fields: FilterField[];
    values: FilterValue[];
    theme: object;
    chosenIssueTypes: string[];
    issueMetadata: IssueMetadata;
    addValidate: () => void;
    removeValidate: () => void;
    onChange: (f: FilterValue[]) => void;
};

type ChannelSettingsFiltersState = {
    showCreateRow: boolean;
};

export default class ChannelSettingsFilters extends React.PureComponent<ChannelSettingsFiltersProps, ChannelSettingsFiltersState> {
    state = {
        showCreateRow: false,
    };

    onConfiguredValueChange = (oldValue: FilterValue | null, newValue: FilterValue) => {
        const newValues = this.props.values.concat([]);
        const index = newValues.findIndex((f) => f === oldValue);

        if (index === -1) {
            newValues.push({exclude: false, values: [], ...newValue});
            this.setState({showCreateRow: false});
        } else {
            newValues.splice(index, 1, newValue);
        }

        this.props.onChange(newValues);
    };

    addNewFilter = () => {
        this.setState({showCreateRow: true});
    };

    hideNewFilter = () => {
        this.setState({showCreateRow: false});
    };

    removeFilter = (value: FilterValue | null) => {
        if (!value) {
            return;
        }

        const newValues = this.props.values.concat([]);
        const index = newValues.findIndex((f) => f === value);

        if (index !== -1) {
            newValues.splice(index, 1);
        }
        this.props.onChange(newValues);
    };

    getConflictingFields = (): {field: FilterField; issueTypes: IssueType[]}[] => {
        const conflictingFields = [];
        for (const field of this.props.fields) {
            const conflictingIssueTypes = [];
            for (const issueTypeId of this.props.chosenIssueTypes) {
                const issueTypes = field.issueTypes;
                if (!issueTypes.find((it) => it.id === issueTypeId)) {
                    const issueType = this.props.issueMetadata.projects[0].issuetypes.find((i) => i.id === issueTypeId) as IssueType;
                    conflictingIssueTypes.push(issueType);
                }
            }
            if (conflictingIssueTypes.length) {
                conflictingFields.push({field, issueTypes: conflictingIssueTypes});
            }
        }
        return conflictingFields;
    };

    render() {
        const {fields, values} = this.props;
        const {showCreateRow} = this.state;

        let error = null;
        const conflictingFields = this.getConflictingFields();
        if (conflictingFields.length) {
            error = (
                <div>
                    {conflictingFields.map((f) => {
                        const issueTypeNames = f.issueTypes.map((i) => i.name).join(', ');
                        const errorMsg = `${f.field.name} is not shown because it does not apply to issue type(s): ${issueTypeNames}.`;
                        return (
                            <p key={f.field.key}>
                                {errorMsg}
                            </p>
                        );
                    })}
                </div>
            );
        }

        return (
            <div>
                {error}
                <ul style={{listStyleType: 'none'}}>
                    {values.map((v, i) => {
                        const field = fields.find((f) => f.key === v.key);
                        if (!field) {
                            return null;
                        }
                        return (
                            <li key={i}>
                                <ChannelSettingsFilter
                                    fields={fields}
                                    field={field}
                                    value={v}
                                    chosenIssueTypes={this.props.chosenIssueTypes}
                                    issueMetadata={this.props.issueMetadata}
                                    onChange={this.onConfiguredValueChange}
                                    removeFilter={this.removeFilter}
                                    theme={this.props.theme}
                                    addValidate={this.props.addValidate}
                                    removeValidate={this.props.removeValidate}
                                />
                            </li>
                        );
                    })}
                    {showCreateRow && (
                        <li>
                            <EmptyChannelSettingsFilter
                                fields={fields}
                                chosenIssueTypes={this.props.chosenIssueTypes}
                                issueMetadata={this.props.issueMetadata}
                                onChange={this.onConfiguredValueChange}
                                theme={this.props.theme}
                                cancelAdd={this.hideNewFilter}
                            />
                        </li>
                    )}
                    <button
                        onClick={this.addNewFilter}
                        disabled={showCreateRow}
                        className='btn btn-info'
                    >
                        {'Add Filter'}
                    </button>
                </ul>
            </div>
        );
    }
}
