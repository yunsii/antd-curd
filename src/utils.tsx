import React from 'react';
import { Divider } from 'antd';
import _flatten from 'lodash/flatten';

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

export const callFunctionIfFunction = (func: any) => (...args: any) => {
  if (func) {
    func(...args);
  }
};

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
