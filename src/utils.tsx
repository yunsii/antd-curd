import React from 'react';
import { Divider } from 'antd';
import _flatten from 'lodash/flatten';
import _pick from 'lodash/pick';
import _get from 'lodash/get';
import _isEqual from 'lodash/isEqual';

export function addDivider(actions) {
  return _flatten(
    actions.map((item, index) => {
      if (index + 1 < actions.length) {
        return [item, <Divider key={`${item.key}_divider`} type="vertical" />];
      }
      return [item];
    })
  );
}

export function injectChildren(children, properties) {
  return React.Children.map(children, child => {
    if (child) {
      const { type: childType } = child;
      if (typeof childType === 'string') {
        return child;
      }
      return React.cloneElement(child, {
        ...properties,
      });
    }
    return child;
  });
}

function getQueryParams(props, fields: string[]) {
  return _pick(_get(props, 'location.query', {}), fields);
}

function initQueryParams(props, fields) {
  return {
    queryParams: getQueryParams(props, fields),
  }
}

export function withQueryParams(fields: string[]) {
  return function (WrappedComponent: React.ComponentClass | React.FC): React.ComponentClass {
    class WithQueryParams extends React.Component<any> {
      static displayName: string;

      static getDerivedStateFromProps(props, state) {
        const { queryParams: thisQueryParams } = state;
        const queryParams = getQueryParams(props, fields);

        if (Object.keys(queryParams).length && !_isEqual(thisQueryParams, queryParams)) {
          return { queryParams };
        }
        return null;
      }

      state = initQueryParams(this.props, fields);

      render() {
        const { queryParams } = this.state;
        return <WrappedComponent {...(this.props as any)} queryParams={queryParams} />;
      }
    }

    WithQueryParams.displayName = `WithQueryParams(${getDisplayName(WrappedComponent)})`;
    return WithQueryParams;
  }
}

function getDisplayName(WrappedComponent: React.ComponentClass | React.FC) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
