import React from 'react';

const ConditionalWrapper = ({condition, wrapper, children}: {condition: boolean; wrapper: (children: React.ReactElement) => React.ReactElement; children: React.ReactElement}) => condition ? wrapper(children) : children;

export default ConditionalWrapper;
