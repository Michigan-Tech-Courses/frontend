import type React from 'react';
import {observer} from 'mobx-react-lite';

const ConditionalWrapper = observer(({condition, wrapper, children}: {condition: boolean; wrapper: (children: React.ReactElement) => React.ReactElement; children: React.ReactElement}) => condition ? wrapper(children) : children);

export default ConditionalWrapper;
