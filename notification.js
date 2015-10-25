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
  
  Template.notification.helpers({
    item: function () {
      var stuff = Items.findOne({ _id: this.item });
      console.log(stuff);
      console.log(this);
      return stuff;
    },
    isCurrentUser: function() {
      return this.toID == Meteor.userId();
    }
  });

  Template.yourItemRequests.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return PrivateMessages.find({ fromID: Meteor.userId() });
      }
      else {
        return null;
      }
    }
  });
  
  Template.yourRequests.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return PrivateMessages.find({ toID: Meteor.userId() });
      }
      else {
        return null;
      }
    }
  });
  
  Template.notifications.helpers({
    notifications: function () {
      if (Meteor.user()) {
        console.log("hi");
        var res = PrivateMessages.find({ $or: [{ $and: [{toID: Meteor.userId()}, {notifyToUser: true}] }, { $and: [{fromID: Meteor.userId()}, {notifyFromUser: true}] } ] });
        console.log(res);
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
        console.log("hi");
        var res = PrivateMessages.find({ $or: [ {toID: Meteor.userId()}, {fromID: Meteor.userId() } ] });
        console.log(res);
        return res;
      }
      else {
        return null;
      }
    }
  });

  var dismissNotification = function(notification)
  {
    console.log(notification);
    if (notification.fromID == Meteor.userId())
    {
      PrivateMessages.update({ _id: notification._id }, { $set: { notifyFromUser: false } });
    }
    else if (notification.toID == Meteor.userId())
    {
      PrivateMessages.update({ _id: notification._id }, { $set: { notifyToUser: false } });
    }
  }
  
  Template.notification.events({
    'click .dismiss': function (event) {
      dismissNotification(this);
    }
  });

  Template.notification.events({
    'click .pickedUp': function (event) {
      Meteor.users.update({ _id: this.fromID }, { $inc: { "profile.itemsPickedUp": 1 } });
      Meteor.users.update({ _id: this.toID }, { $inc: { "profile.itemsDonated": 1 } });
      PrivateMessages.remove(this._id);
      Items.remove(this.item);
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
    }
  });
  
  Template.fullNotificationThread.events({
    'submit #addReplyToNotification': function (event) {
      if (this.notificationThread.fromID == Meteor.userId())
      {
        PrivateMessages.update({_id: this.notificationThread._id}, { $push: { replies: {message: event.target.message.value, time: new Date(), fromID: Meteor.userId() } }, $set: { notifyToUser: true} });
      }
      else if (this.notificationThread.toID == Meteor.userId())
      {
        PrivateMessages.update({_id: this.notificationThread._id}, { $push: { replies: {message: event.target.message.value, time: new Date(), fromID: Meteor.userId() } }, $set: { notifyFromUser: true} });
      }
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
  
  if (findResult.toID == Meteor.userId() || findResult.fromID == Meteor.userId())
  {
    this.render('fullNotificationThread', { data: {notificationThread: findResult} }); 
  }
  else
  {
    this.render('fullNotificationThread', { data: {} });
  }
});

