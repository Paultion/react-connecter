import React from 'react';
import connect from '../../../';
import AppStore from './AppStore';
import './App.css';

const appView = ({ data, actions, type }) => {
  const { value, test } = data;
  const { onUpdateValue, onUpdateTest } = actions;
  return (
    <div>
      {value}
      <br/>
      {test.a || test}
      <br/>
      <a style={{ cursor: 'pointer' }} onClick={onUpdateValue}>值加一</a>
      <br/>
      <a style={{ cursor: 'pointer' }} onClick={onUpdateTest}>测试值加一</a>
    </div>
  );
};

export default _ => {
  return (
    <div>
      {connect(appView, new AppStore())}
    </div>
  );
};
