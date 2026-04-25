import React from 'react';
import Select, { SingleValue } from 'react-select';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    value: SingleValue<Option>;
    onChange: any
    multi: boolean
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, multi }) => {
    return (
        <Select
            value={value}
            onChange={onChange}
            isMulti={multi}
            options={options}
        />
    );
};

export default CustomSelect;
