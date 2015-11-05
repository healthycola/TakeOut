if (Meteor.isClient) {
  Template.header.helpers({
    notificationCount: function () {
      if (Meteor.user()) {
        return getAllNotificationsForUser(Meteor.userId()).length;
      }
      else {
        return 0;
      }
    }
  });
  
  Template.registerHelper("isCountZero", function (array) {
    if (array != null)
    {
      return array.length == 0;
    }
    else
    {
      return true;
    }
  });
  
  Template.notification.helpers({
    item: function () {
      return getItem(this.item);
    },
    
    isCurrentUser: function() {
      return isCurrentUser(this.toID);
    }
  });

  Template.yourItemRequests.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return getRequestedNotifications(Meteor.userId());
      }
      else {
        return null;
      }
    }
  });
  
  Template.yourRequests.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return getRequestsNotifications(Meteor.userId());
      }
      else {
        return null;
      }
    }
  });
  
  Template.notifications.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return getAllNotificationsForUser(Meteor.userId());
      }
      else {
        return null;
      }
    }
  });
  
  Template.pendingRequests.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return getPendingRequestNotifications(Meteor.userId());
      }
      else {
        return null;
      }
    }
  });
  
  Template.notification.events({
    'click .dismiss': function (event) {
      dismissNotification(this);
    }
  });

  Template.notification.events({
    'click .pickedUp': function (event) {
      if (this.toID == Meteor.userId())
      {
        updateUserAfterItemPickup(this.fromID, this.toID);
        addReply(this, "[AUTO GENERATED] This item was picked up!");
        updateItemPickup(this.item, this.fromID);
        closeThread(this);
      }
    }
  });
  
  Template.fullNotificationThread.onRendered(function () {
    dismissNotification(this.data.notificationThread);
  });
  
  Template.fullNotificationThread.helpers({
    item: function() { 
      return getItem(this.notificationThraed.item);
    },
    
    fromUser: function() { 
      return getUser(this.notificationThread.fromID);
    },
    
    isItemStillAvailable: function()
    {
      return isAvailable(this.notificationThread.item);
    }
  });
  
  Template.fullNotificationThread.events({
    'submit #addReplyToNotification': function (event) {
      addReply(this.notificationThread, event.target.message.value);
      event.target.message.value = "";
      return false;
    }
  });
  
  Template.reply.helpers({
    isCurrentUser: function() {
      return isCurrentUser(this.fromID);
    },
    
    user: function() {
      return getUser(this.fromID);
    }
  })
}

