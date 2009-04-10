/*
 * Copyright (c) 2001-2007, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.events = {};

// A list of IDE event types
jsx3.ide.events.COMPONENT_EDITOR_DID_ACTIVATE = "componentEditorDidActivate";
jsx3.ide.events.COMPONENT_EDITOR_DID_DEACTIVATE = "componentEditorDidDeactivate";
jsx3.ide.events.COMPONENT_EDITOR_RESET = "componentEditorReset";
jsx3.ide.events.COMPONENT_EDITOR_STATS = "componentEditorStats";
jsx3.ide.events.OBJECT_PROPERTY_DID_CHANGE = "objectPropertyDidChange";
jsx3.ide.events.SELECTED_DOM_DID_CHANGE = "selectedDomDidChange";
jsx3.ide.events.OBJECT_EVENT_DID_CHANGE = "objectEventDidChange";
jsx3.ide.events.OBJECT_ATTRIBUTE_DID_CHANGE = "objectAttributeDidChange";
jsx3.ide.events.OBJECT_PARAMETER_DID_CHANGE = "objectParameterDidChange";
jsx3.ide.events.EDITOR_DID_OPEN = "editorDidOpen";
jsx3.ide.events.EDITOR_DID_CLOSE = "editorDidClose";
jsx3.ide.events.COMPONENT_EDITOR_WILL_CLOSE = "compEditorWillClose";
jsx3.ide.events.COMPONENT_EDITOR_WILL_REVERT = "compEditorWillRevert";
jsx3.ide.events.EDITOR_MODE_CHANGED = "editorModeChanged";
jsx3.ide.events.EDITOR_SAVED_AS = "editorSavedAs";
jsx3.ide.events.ACTIVE_EDITOR_CHANGED = "activeEditorChanged";
jsx3.ide.events.RESOURCE_SETTINGS_DID_CHANGE = "resourceSettingsDidChange";
jsx3.ide.events.OBJECT_WAS_RECYCLED = "objectWasRecycled";
jsx3.ide.events.OBJECT_WAS_UNRECYCLED = "objectWasUnrecycled";
jsx3.ide.events.RECYCLE_BIN_WAS_EMPTIED = "recycleBinWasEmptied";
jsx3.ide.events.COMPONENTS_RELOADED = "componentsReloaded";
jsx3.ide.events.STARTUP = "startup";
jsx3.ide.events.BEFORE_SHUTDOWN = "beforeShutdown";
jsx3.ide.events.SHUTDOWN = "shutdown";
jsx3.ide.events.FOCUS_RECTANGLE_MOVED = "focusRectangleMoved";
jsx3.ide.events.FOCUS_RECTANGLE_TOGGLED = "focusRectangleToggled";
jsx3.ide.events.COMPONENT_EDITOR_SAVED = "componentEditorSaved";
jsx3.ide.events.DEPLOY_OPTIONS_CHANGED = "deployOptionsChanged";

// hook up events with static jsx3.ide methods ... can be refactored eventually
jsx3.ide.setUpEventListeners = function() {
	jsx3.IDE.subscribe(jsx3.ide.events.OBJECT_PROPERTY_DID_CHANGE, jsx3.ide.onJsxPropertyChange);
	jsx3.IDE.subscribe(jsx3.ide.events.OBJECT_PROPERTY_DID_CHANGE, jsx3.ide.showFocusRectangle);
	jsx3.IDE.subscribe(jsx3.ide.events.OBJECT_PROPERTY_DID_CHANGE, jsx3.ide.checkDomAnnotationChange);
	jsx3.IDE.subscribe(jsx3.ide.events.COMPONENT_EDITOR_RESET, jsx3.ide.onDomChangeSleep);
	jsx3.IDE.subscribe(jsx3.ide.events.SELECTED_DOM_DID_CHANGE, jsx3.ide.onPropertiesChangeSleep);
	jsx3.IDE.subscribe(jsx3.ide.events.SELECTED_DOM_DID_CHANGE, jsx3.ide.onModelEventChangeSleep);
	jsx3.IDE.subscribe(jsx3.ide.events.SELECTED_DOM_DID_CHANGE, jsx3.ide.onAttributeChangeSleep);
	jsx3.IDE.subscribe(jsx3.ide.events.SELECTED_DOM_DID_CHANGE, jsx3.ide.showFocusRectangle);
	jsx3.IDE.subscribe(jsx3.ide.events.OBJECT_EVENT_DID_CHANGE, jsx3.ide.onJsxModelEventsChange);
	jsx3.IDE.subscribe(jsx3.ide.events.EDITOR_DID_OPEN, jsx3.ide.syncPreviouslyOpenFiles);
	jsx3.IDE.subscribe(jsx3.ide.events.EDITOR_DID_CLOSE, jsx3.ide.syncPreviouslyOpenFiles);
	jsx3.IDE.subscribe(jsx3.ide.events.EDITOR_DID_OPEN, jsx3.ide.updateCacheIfCompEditor);
	jsx3.IDE.subscribe(jsx3.ide.events.EDITOR_DID_CLOSE, jsx3.ide.updateCacheIfCompEditor);
//  jsx3.IDE.subscribe(jsx3.ide.events.ACTIVE_EDITOR_CHANGED, jsx3.ide.updateCache);
	jsx3.IDE.subscribe(jsx3.ide.events.COMPONENT_EDITOR_RESET, jsx3.ide.updateCacheSleep);
	jsx3.IDE.subscribe(jsx3.ide.events.EDITOR_SAVED_AS, jsx3.ide.syncPreviouslyOpenFiles);
	jsx3.IDE.subscribe(jsx3.ide.events.RESOURCE_SETTINGS_DID_CHANGE, jsx3.ide.updateResources);
	jsx3.IDE.subscribe(jsx3.ide.events.OBJECT_ATTRIBUTE_DID_CHANGE, jsx3.ide.onJsxAttributesChange);
	jsx3.IDE.subscribe(jsx3.ide.events.OBJECT_WAS_RECYCLED, jsx3.ide.setEditorDirtyForRecycle);
	jsx3.IDE.subscribe(jsx3.ide.events.FOCUS_RECTANGLE_MOVED, jsx3.ide.onPropertiesChange);
	jsx3.IDE.subscribe(jsx3.ide.events.FOCUS_RECTANGLE_MOVED, jsx3.ide.setActiveEditorDirty);
	jsx3.IDE.subscribe(jsx3.ide.events.SELECTED_DOM_DID_CHANGE, jsx3.ide.onXslParameterChangeSleep);
	jsx3.IDE.subscribe(jsx3.ide.events.OBJECT_PARAMETER_DID_CHANGE, jsx3.ide.onXslParameterChange);
	jsx3.IDE.subscribe(jsx3.ide.events.OBJECT_PARAMETER_DID_CHANGE, jsx3.ide.setActiveEditorDirty);
	jsx3.IDE.subscribe(jsx3.ide.events.EDITOR_MODE_CHANGED, jsx3.ide.updateFocusOnModeChange);
	jsx3.IDE.subscribe(jsx3.ide.events.COMPONENT_EDITOR_SAVED, jsx3.ide.onDomChangeSleep);
	jsx3.IDE.subscribe(jsx3.ide.events.DEPLOY_OPTIONS_CHANGED, jsx3.ide.updateResources);
	jsx3.IDE.subscribe(jsx3.ide.events.COMPONENT_EDITOR_WILL_CLOSE, jsx3.ide.cleanUpOrphanedCacheEditors);
	jsx3.IDE.subscribe(jsx3.ide.events.COMPONENT_EDITOR_WILL_REVERT, jsx3.ide.cleanUpOrphanedCacheEditors);
  jsx3.IDE.subscribe(jsx3.ide.events.COMPONENT_EDITOR_STATS, jsx3.ide.updateComponentStats);

	jsx3.IDE.registerHotKey(function() {jsx3.ide.toggleFocusRectangle(true);}, 'r', true, false, true);
};
