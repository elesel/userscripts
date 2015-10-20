// ==UserScript==
// @name        Inbox by Gmail Title Updater
// @version     0.1.0
// @namespace   elesel/userscripts
// @decription  Updates page title to tell the browser when a new/snoozed email or chat arrives
// @include     https://inbox.google.com/*
// @license     MIT License; http://www.opensource.org/licenses/mit-license.php
// @run-at      document-start
// @grant       none
// @icon        https://ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/ic_product_inbox_16dp_r2_2x.png
// ==/UserScript==

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
    window.setTimeout(updateTitle, 5000);
    timeoutWaiting = true;
  }
  
  /*
  mutationRecords.forEach(function (mutation) {
    if (mutation.type == 'childList') {
      if (typeof mutation.addedNodes == 'object' && mutation.addedNodes.length) {
        for (var J = 0, L = mutation.addedNodes.length; J < L; ++J) {
          if (checkForClass(mutation.addedNodes[J], 'G3')) {
            unreadAffected = true;
          }
          if (checkForText(mutation.addedNodes[J], 'Unread')) {
            unreadAffected = true;
          }
        }
      }
      if (typeof mutation.removedNodes == 'object' && mutation.removedNodes.length) {
        for (var J = 0, L = mutation.removedNodes.length; J < L; ++J) {
          if (checkForClass(mutation.removedNodes[J], 'G3')) {
            unreadAffected = true;
          }
          if (checkForText(mutation.removedNodes[J], 'Unread')) {
            unreadAffected = true;
          }
        }
      }
    } else if (mutation.type == 'attributes') {
      if (checkForText(mutation.target, 'Unread')) {
        unreadAffected = true;
      }
    }
  });
  
  */
}

function updateTitle() {
  // Get unread email count
  var elements = document.getElementsByClassName("G3");
  var unreadCount = 0;
  for (var J = 0, L = elements.length; J < L; ++J) {
    var element = elements[J];
    if (element.tagName === 'DIV' && checkForText(element, 'Unread')) {
      unreadCount++;
    }
  }
  
  // Get total email count
  var elements = document.getElementsByClassName("top-level-item");
  var totalCount = 0;
  for (var J = 0, L = elements.length; J < L; ++J) {
    var element = elements[J];
    if (element.tagName === 'DIV') {
      totalCount++;
    }
  }

  // Get chat count
  var elements = document.getElementsByClassName("ez");
  var chatCount = 0;
  for (var J = 0, L = elements.length; J < L; ++J) {
    var element = elements[J];
    if (element.tagName === 'DIV' && (! checkForClass(element, 'k6')) && element.clientWidth > 1) {
      chatCount++;
    }
  }

  // Update title if changed
  var currentTitle = document.title;
  /*
  console.log('unreadCount =', unreadCount);
  console.log('chatCount =', chatCount);
  console.log('currentTitle =', currentTitle);
  */
  if (currentTitle.match(/^Inbox/)) {
    var newTitle = currentTitle.replace(
      /^(Inbox)[^â€“]+/, '$1 ' + 
      ((unreadCount || totalCount) ? '(' + unreadCount + '/' + totalCount + ') ' : '') + 
      (chatCount ? '(' + chatCount + ' chat) ' : '')
    );
    if (newTitle != currentTitle) {
      //console.log('newTitle =', newTitle);
      document.title = newTitle;
    }
  }
  
  timeoutWaiting = false;
}

function checkForClass(node, className) {
  if (node.nodeType === 1 && node.classList.contains(className)) {
    console.log('New node with class "' + className + '" = ', node);
    return true;
  }
  return false;
}

function checkForText(node, text) {
  if (node.nodeType === 1 && node.hasChildNodes()) {
    var firstChild = node.firstChild;
    if (firstChild.nodeType === 3) {
      if (firstChild.nodeValue.indexOf(text) > -1) {
        return true;
      }
    }
  }
  return false;
}

/*
Unread: <div class="G3" jsan="7.G3" jstcache="1650"> Unread </div>
Read: <div style="display:none" jstcache="1650"> Unread </div>
Chat: <iframe id="gtn_pos8on" class="be lR" frameborder="0" style="visibility: visible; width: 262px; height: 420px;" src="https://talkgadget.google.com/u/0/talkgadget/_/frame?v=1444929423&hl=en&pvt=AMP3uWYspRTgk3_zPi8HIG6_PggROpB8mIapF7kdYLZCGG8uU5l5ldnRdxkbmJNv5jz0kd26aujBrvqkJfdItS691q5PE655CGFZ_FnDAmYtaL2_JvSVed4#egtn_pos8on" jstcache="3114" scrolling="no">
  Use iframe + class + width: 262px
*/
