import React from 'react';
import '../styles/FailedCross.css';

const FailedCross = () => {
    return (
        <svg class="crossmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="crossmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <line class="crossmark__cross" x1="15" y1="15" x2="37" y2="37" stroke="red" stroke-width="2" />
            <line class="crossmark__cross" x1="37" y1="15" x2="15" y2="37" stroke="red" stroke-width="2" />
        </svg>
    );
};

export default FailedCross;