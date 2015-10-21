Items = new Mongo.Collection("items");

Meteor.users.allow({
  update: function (userId, doc, fieldNames, modifier) {
    /* user and doc checks ,
    return true to allow insert */
    return true;
  }
});

if (Meteor.isClient) {
  Template.additem.onRendered(function () {
    this.$('.datetimepicker').datetimepicker();
  });

  Session.setDefault('imageURL', '');

  Template.additem.helpers({
    imageURL: function () {
      return Session.get('imageURL');
    }
  });

  Template.additem.events({
    'submit #additem': function (event) {

      var insertedItem = Items.insert(
        {
          name: event.target.name.value,
          ageDay: event.target.ageInDays.value,
          ageHour: event.target.ageInHours.value,
          imageURL: event.target.imageURL.value,
          ownerID: Meteor.userId(),
          postedOn: new Date(),
          pickupAfter: event.target.schedulingAfter.value,
          pickupBefore: event.target.schedulingBefore.value,
        });

      Session.set('imageURL', '');
      Router.go('ShowItems');
      return false;
    },

    'change .filename': function (event) {
      Session.set('imageURL', event.originalEvent.fpfile.url);
    }
  });

  Template.Request.onRendered(function () {
    this.$('.datetimepicker').datetimepicker();
  });

  Template.Request.events({
    'submit #requestItem': function (event) {

      var messageContent = event.target.message.value + "<br/>" + event.target.schedulingRequest.value;
      console.log(this);
      var test = PrivateMessages.insert(
        {
          fromID: Meteor.userId(),
          toID: this.item.ownerID,
          message: event.target.message.value,
          pickupTimeRequested: event.target.schedulingRequest.value,
          item: this.item._id
        });
      /*
      Meteor.call('sendEmail',
            (Meteor.users.findOne({_id : this.item.ownerID})).profile.email,
            Meteor.user().profile.email,
            'Request from TakeOut',
            messageContent);
       */
      Router.go('RequestSent');

      return false;
    },

    'change .filename': function (event) {
      Session.set('imageURL', event.originalEvent.fpfile.url);
    }
  });

  Template.ShowItems.helpers({
    items: function () {
      return Items.find();
    }
  });

  Template.MyItems.helpers({
    items: function () {
      return Items.find({ ownerID: Meteor.userId() });
    }
  });

  Template.item.events({
    'click .itemClick': function (event) {
      Router.go('/items/' + this._id);
    }
  });

  Template.myItem.events({
    'click .delete': function (event) {
      Items.remove(this._id);
    }
  });
}

Router.route('/ShowItems', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context
  this.render('ShowItems');
});

Router.route('/MyItems', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context
  this.render('MyItems');
});

Router.route('/RequestSent', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context
  this.render('RequestSent');
});

Router.route('/items/:_id', function () {
  this.layout('LayoutOne');
  var findResult = Items.findOne({ _id: this.params._id });

  if (findResult) {
    var ownerFindResult = Meteor.users.findOne({ _id: findResult.ownerID });
    if (ownerFindResult) {
      this.render('ShowSingleItem', { data: { item: findResult, owner: ownerFindResult } });
    }
    else {
      this.render('ShowSingleItem', { data: {} });
    }
  }
  else {
    this.render('ShowSingleItem', { data: {} });
  }
});


Router.route('/request/:_id', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context

  var findResult = Items.findOne({ _id: this.params._id });

  if (findResult) {
    var ownerFindResult = Meteor.users.findOne({ _id: findResult.ownerID });
    if (ownerFindResult) {
      this.render('Request', { data: { item: findResult, owner: ownerFindResult } });
    }
    else {
      this.render('Request', { data: {} });
    }
  }
  else {
    this.render('Request', { data: {} });
  }
});



// Router.route('/items/:_id', function () {
//   var item = Items.findOne({_id: this.params._id});
//   this.render('ShowItem', {data: item});
// });