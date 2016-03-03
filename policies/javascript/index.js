'use strict';
const vm    = require('vm');
const _     = require('lodash');
const debug = require('debug')('policy:javascript');

module.exports = function(config) {
  return function(props, context, flow) {
    var logger = flow.logger;
    logger.debug('ENTER javascript policy');

    if (_.isUndefined(props.source) || !_.isString(props.source)) {
      flow.fail({name:'JavaScriptError', value: 'Invalid JavaScript code'});
      return;
    }
    //need to wrap the code snippet into a function first
    var script = new vm.Script('() => {' + props.source + '}()');
    try {
      //use context as this to run the wrapped function
      script.runInNewContext(context);
      logger.debug('EXIT')
      flow.proceed();
    } catch (e) {
      logger.debug('EXIT with an error:%s', e);
      if ( e.name ) {
        flow.fail(e);
      } else {
        flow.fail({name: 'JavaScriptError', value: '' + e});
      }
    }
  };
};
