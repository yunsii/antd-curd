import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
import CurdListDemo from './CurdListDemo';
import QueryPanelDemo from './CurdQueryDemo';
import StandardTableDemo from './StandardTableDemo';
import CurdTableDemo from './CurdTableDemo';
import CurdDemo from './CurdDemo';
import StandardListDemo from './StandardListDemo';

storiesOf('components', module)
  .add('StandardTable', () => <StandardTableDemo />)
  .add('StandardList', () => <StandardListDemo />)

storiesOf('curd components', module)
  .add('QueryPanel', () => <QueryPanelDemo />)
  .add('CurdTable', () => <CurdTableDemo />)
  .add('CurdList', () => <CurdListDemo />)
  .add('CurdDemo', () => <CurdDemo />);
