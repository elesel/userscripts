// ==UserScript==
// @name        Inbox by Gmail Title Updater
// @version     0.1.5
// @namespace   elesel/userscripts
// @decription  Updates page title to tell the browser when a new/snoozed email or chat arrives
// @include     https://inbox.google.com/*
// @license     MIT License; http://www.opensource.org/licenses/mit-license.php
// @grant       none
// @icon        https://ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/ic_product_inbox_16dp_r2_2x.png
// @updateURL   https://github.com/elesel/userscripts/raw/master/Inbox_by_Gmail_Title_Updater.user.js
// @downloadURL https://github.com/elesel/userscripts/raw/master/Inbox_by_Gmail_Title_Updater.user.js
// ==/UserScript==

"use strict";

var timeoutWaiting = false;

// Mutation handling
var MutationObserver = window.MutationObserver;
var myObserver = new MutationObserver(mutationHandler);
var obsConfig = {
  childList: true,
  attributes: true,
  subtree: true,
  attributeFilter: [
    'class'
  ]
};
myObserver.observe(document, obsConfig);

function mutationHandler(mutationRecords) {
  if (! timeoutWaiting) {
    window.setTimeout(updateTitle, 250);
    timeoutWaiting = true;
  }
}

function updateTitle() {
  // Get unread email count
  var elements = document.getElementsByClassName("G3");
  var unreadCount = 0;
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (element.tagName === 'DIV' && checkForText(element, 'Unread')) {
      unreadCount++;
    }
  }
  
  // Get total email count
  var elements = document.getElementsByClassName("top-level-item");
  var totalCount = 0;
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (element.tagName === 'DIV') {
      totalCount++;
    }
  }

  // Get chat count
  var elements = document.getElementsByClassName("ez");
  var chatCount = 0;
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (element.tagName === 'DIV' && (! checkForClass(element, 'k6')) && element.clientWidth > 1) {
      chatCount++;
    }
  }

  // Update title if changed
  var currentTitle = document.title;
  console.log('unreadCount =', unreadCount, ' chatCount =', chatCount, ' currentTitle =', currentTitle);
  if (currentTitle.match(/^Inbox/)) {
    var newTitle = currentTitle.replace(
      /^(Inbox)[^–]+/, '$1 ' + 
      ((unreadCount || totalCount) ? '(' + unreadCount + '/' + totalCount + ') ' : '') + 
      (chatCount ? '(' + chatCount + ' chat) ' : '')
    );
    if (newTitle != currentTitle) {
      console.log('newTitle =', newTitle);
      document.title = newTitle;
    }
  }
  
  timeoutWaiting = false;
}

function checkForClass(node, className) {
  return (
    node.nodeType === 1 && 
    node.classList.contains(className)
  );
}

function checkForText(node, text) {
  return (
    node.nodeType === 1 && 
    node.hasChildNodes() && 
    node.firstChild.nodeType === 3 && 
    node.firstChild.nodeValue.indexOf(text) > -1
  );
}
