PrivateMessages = new Mongo.Collection("pms");

if (Meteor.isClient) {
  Template.header.helpers({
    notificationCount: function () {
      if (Meteor.user()) {
        return PrivateMessages.find({ $or: [{ $and: [{toID: Meteor.userId()}, {notifyToUser: true}] }, { $and: [{fromID: Meteor.userId()}, {notifyFromUser: true}] } ] }).fetch().length;
      }
      else {
        return 0;
      }
    }
  });
  
  Template.registerHelper("isCountZero", function (array) {
    console.log(array);
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
      var stuff = Items.findOne({ _id: this.item });
      return stuff;
    },
    isCurrentUser: function() {
      return this.toID == Meteor.userId();
    }
  });

  Template.yourItemRequests.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return PrivateMessages.find({ fromID: Meteor.userId() }).fetch();
      }
      else {
        return null;
      }
    }
  });
  
  Template.yourRequests.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return PrivateMessages.find({ toID: Meteor.userId() }).fetch();
      }
      else {
        return null;
      }
    }
  });
  
  Template.notifications.helpers({
    notifications: function () {
      if (Meteor.user()) {
        var res = PrivateMessages.find({ $or: [{ $and: [{toID: Meteor.userId()}, {notifyToUser: true}] }, { $and: [{fromID: Meteor.userId()}, {notifyFromUser: true}] } ] }).fetch();
        return res;
      }
      else {
        return null;
      }
    }
  });
  
  Template.pendingRequests.helpers({
    notifications: function () {
      if (Meteor.user()) {
        var res = PrivateMessages.find({$and: [{ $or: [ {toID: Meteor.userId()}, {fromID: Meteor.userId() } ] }, {pickupComplete : false}] }).fetch();
        return res;
      }
      else {
        return null;
      }
    }
  });

  var dismissNotification = function(notification)
  {
    if (notification != null)
    {
      if (notification.fromID == Meteor.userId())
      {
        PrivateMessages.update({ _id: notification._id }, { $set: { notifyFromUser: false } });
      }
      else if (notification.toID == Meteor.userId())
      {
        PrivateMessages.update({ _id: notification._id }, { $set: { notifyToUser: false } });
      }
    }
  }
  
  Template.notification.events({
    'click .dismiss': function (event) {
      dismissNotification(this);
    }
  });

  Template.notification.events({
    'click .pickedUp': function (event) {
      if (this.toID == Meteor.userId())
      {
        Meteor.users.update({ _id: this.fromID }, { $inc: { "profile.itemsPickedUp": 1 } });
        Meteor.users.update({ _id: this.toID }, { $inc: { "profile.itemsDonated": 1 } });
        addReply(this, "[AUTO GENERATED] This item was picked up!");
        dismissNotification(this);
        Items.update({ _id: this.item }, { $set: { pickupUserId: this.fromID } });
        PrivateMessages.update({ _id: this._id }, { $set: { openThread: false } });
      }
    }
  });
  
  Template.fullNotificationThread.onRendered(function () {
    dismissNotification(this.data.notificationThread);
  });
  
  
  Template.fullNotificationThread.helpers({
    item: function() { 
      return Items.findOne({ _id: this.notificationThread.item });
    },
    
    fromUser: function() { 
      return Meteor.users.findOne({ _id: this.notificationThread.fromID });
    },
    
    isItemStillAvailable: function()
    {
      var val = Items.findOne({ $and: [{ _id: this.notificationThread.item }, { pickupUserId: null }] });
      return val != null;
    }
  });
  
  addReply = function(notification, reply)
  {
    if (notification.fromID == Meteor.userId())
    {
      PrivateMessages.update({_id: notification._id}, { $push: { replies: {message: reply, time: new Date(), fromID: Meteor.userId() } }, $set: { notifyToUser: true} });
    }
    else if (notification.toID == Meteor.userId())
    {
      PrivateMessages.update({_id: notification._id}, { $push: { replies: {message: reply, time: new Date(), fromID: Meteor.userId() } }, $set: { notifyFromUser: true} });
    }
  }
  
  Template.fullNotificationThread.events({
    'submit #addReplyToNotification': function (event) {
      addReply(this.notificationThread, event.target.message.value);
      event.target.message.value = "";
      return false;
    }
  });
  
  Template.reply.helpers({
    isCurrentUser: function() {
      return this.fromID == Meteor.userId();
    },
    
    user: function() {
      return Meteor.users.findOne({ _id: this.fromID });
    }
  })
}

Router.route('yourItemRequests', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context

  this.render('yourItemRequests');
});

Router.route('yourRequests', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context

  this.render('yourRequests');
});

Router.route('notifications', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context

  this.render('notifications');
});

Router.route('pendingRequests', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context

  this.render('pendingRequests');
});


Router.route('notifications/:_id', function () {
  this.layout('LayoutOne');
  
  var findResult = PrivateMessages.findOne({ _id: this.params._id });
  
  console.log(findResult);
  if ((findResult != null) && (findResult.toID == Meteor.userId() || findResult.fromID == Meteor.userId()))
  {
    this.render('fullNotificationThread', { data: {notificationThread: findResult} }); 
  }
  else
  {
    this.render('fullNotificationThread', { data: {} });
  }
});

