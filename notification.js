PrivateMessages = new Mongo.Collection("pms");

if (Meteor.isClient) {
  Template.header.helpers({
    notificationCount: function () {
      if (Meteor.user()) {
        return PrivateMessages.find({ toID: Meteor.userId() }).fetch().length;
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
    }
  });

  Template.notifications.helpers({
    notifications: function () {
      if (Meteor.user()) {
        return PrivateMessages.find({ toID: Meteor.userId() });
      }
      else {
        return null;
      }
    }
  });

  Template.notification.events({
    'click .delete': function (event) {
      PrivateMessages.remove(this._id);
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
      
      console.log(this);
      PrivateMessages.update({_id: this.notificationThread._id}, {$push: { replies: {message: event.target.message.value, time: new Date() } }});
      console.log(this);
      return false;
    }
  });
}

Router.route('notifications', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context

  this.render('notifications');
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

