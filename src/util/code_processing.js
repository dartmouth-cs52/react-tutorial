/* eslint-disable no-unused-vars */
import React from 'react';
import * as babel from 'babel-standalone';
import {
  pipe,
  beginsWith,
} from './helpers';
import {
  EMPTY_APP_CODE,
  EMPTY_ITEM_CODE,
  WRAPPED_COMPONENT_CODE,
} from './constants';


const babelOptions = {
  presets: ['react', 'es2017'],
  plugins: ['transform-class-properties'],
};

const transformCode = (code) => {
  const babelCode = babel.transform(code, babelOptions).code;
  return babelCode.replace('"use strict";', '').trim();
};

const createDummyApp = (code) => {
  const func = new Function('React', code);
  const App = func(React);
  return App;
};

const wrapComponentsInAppCodeString = (appCode) => {
  // look for bugs associated with this
  const appCodeToDoItem = appCode
    .replace(/ToDoItem/g, 'ToDoItemWrapped');

  return appCodeToDoItem;
};

const appendWrappedComponentToString = (componentCode, componentName) => {
  const addition = `\nconst ${componentName}Wrapped = wrappedComponent(${componentName}, '${componentName}')`;
  return componentCode + addition;
};

export const processCode = (appCode, itemCode) => {
  try {
  // test for empty strings
    const itemComponent = itemCode === '' ? EMPTY_ITEM_CODE : itemCode;
    const appComponent = appCode === '' ? EMPTY_APP_CODE : appCode;

    // adjust strings for wrapping
    const appCodeCleaned = pipe(
      wrapComponentsInAppCodeString,
      transformCode,
    )(appComponent);

    const itemCodeCleaned = pipe(
      appendWrappedComponentToString,
      transformCode,
    )(itemComponent, 'ToDoItem');

    const wrappedComponentCleaned = transformCode(WRAPPED_COMPONENT_CODE);

    return `
          ${wrappedComponentCleaned}\n
          ${itemCodeCleaned}\n
          ${appCodeCleaned}\n
          return App;`;
  } catch (err) {
    return `${err.name}: ${err.message}`;
  }
};

export const runCode = (codeString) => {
  let code = codeString;

  if (codeString === '') {
    code = processCode(EMPTY_APP_CODE, EMPTY_ITEM_CODE);

    // might not be the cleanest way to do this
  } else if (beginsWith('SyntaxError', code)) {
    throw new Error(code);
  }

  return createDummyApp(code);
};
