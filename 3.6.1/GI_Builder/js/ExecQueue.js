/*
 * Copyright (c) 2001-2008, TIBCO Software Inc.
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
    this._running = true;
    
    var me = this;
    /* @jsxobf-clobber */
    this._timeoutfct = function() {me._execNext();};
  };
	
  ExecQueue_prototype.start = function() {
//    jsx3.util.Logger.GLOBAL.logStack("start");
    this._running = true;
    this._start();
  };
  
  ExecQueue_prototype.pause = function() {
//    jsx3.util.Logger.GLOBAL.logStack("pause");
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
    
    if (this._running && this._queue.length == 1)
      this._start();
  };

  /** @private @jsxobf-clobber */
  ExecQueue_prototype._start = function() {
    jsx3.sleep(this._timeoutfct, "jsx3.ide.eq");
  };
  
  /** @private @jsxobf-clobber */
  ExecQueue_prototype._execNext = function() {
//    jsx3.ide.LOG.logStack(3, "_execNext " + this._running + " " + this._queue.length);
    if (!this._running) return;
    
    var job = this._queue.shift();
    if (job) {
      // set this first so that exception in job can't prevent next job from running
      this._start();
      job(this);
    }
  };
  
});
