/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.Class.defineClass("jsx3.util.ExecQueue", null, null, function(ExecQueue, ExecQueue_prototype) {

  /**
   * 
   */
	ExecQueue_prototype.init = function() {
    /* @jsxobf-clobber */
    this._queue = [];
    /* @jsxobf-clobber */
    this._timeoutid = null;
    /* @jsxobf-clobber */
    this._running = true;
    
    var me = this;
    /* @jsxobf-clobber */
    this._timeoutfct = function() {me._execNext();};
  };
	
  ExecQueue_prototype.start = function() {
//    jsx3.util.Logger.GLOBAL.logStack("start");
    this._running = true;
    if (this._timeoutid == null)
      this._start();
  };
  
  ExecQueue_prototype.pause = function() {
//    jsx3.util.Logger.GLOBAL.logStack("pause");
    if (this._timeoutid) {
      window.clearTimeout(this._timeoutid);
      this._timeoutid = null;
    }
    
    this._running = false;
  };
  
  /**
   * 
   */
  ExecQueue_prototype.addJob = function(fctJob, intPos) {
    if (intPos == null) 
      intPos = this._queue.length;
    else 
      intPos = Math.max(0, Math.min(intPos, this._queue.length));
    
    this._queue.splice(intPos, 0, fctJob);
    
    if (this._running && this._timeoutid == null)
      this._start();
  };

  /** @private @jsxobf-clobber */
  ExecQueue_prototype._start = function() {
    this._timeoutid = window.setTimeout(this._timeoutfct, 0);
  };
  
  /** @private @jsxobf-clobber */
  ExecQueue_prototype._execNext = function() {
    if (!this._running) return;
    
    var job = this._queue.shift();
    if (job) {
      // set this first so that exception in job can't prevent next job from running
      this._timeoutid = window.setTimeout(this._timeoutfct, 0);
      job(this);
    } else {
      this._timeoutid = null;
    }
  };
  
});
