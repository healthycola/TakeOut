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


  Template.header.helpers({
    notificationCount: function () {
      if (Meteor.user())
      {
        return PrivateMessages.find({toID: Meteor.userId()}).fetch().length;
      }
      else
      {
        return 0;
      }
    }
  });

  Template.notifications.helpers({
    notifications: function () {
      if (Meteor.user())
      {
        return PrivateMessages.find({toID: Meteor.userId()});
      }
      else
      {
        return null;
      }
    }
  });

  var addItem = function () {
      var latLng = Geolocation.latLng();

      if (! latLng) {
        latLng = {};
        latLng.lng  = 0;
        latLng.lat = 0;
      }

      Session.set("device-lat", latLng.lat);
      Session.set("device-lng", latLng.lng);

      console.log(latLng);

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
          pickupUserId: null,
          loc : {
              type: "Point",
              coordinates: [ latLng.lng, latLng.lat ]
            }
        });

        Session.set('imageURL', '');
        Router.go('ShowItems');
  };

  Template.additem.events({
    'submit #additem': function(event) {
    addItem();
    return false;
    },

    'change .filename': function (event) {
      Session.set('imageURL', event.originalEvent.fpfile.url);
    }
  });

  var onRequestRendered = function (item) {
    $('.datetimepicker').datetimepicker({
      minDate: new Date(item.pickupAfter),
      maxDate: new Date(item.pickupBefore)
    });
  };

  Template.Request.onRendered(function() {
    onRequestRendered(this.data.item);
  });

  Template.Request.events({
    'submit #requestItem': function(event) {

      var messageContent = event.target.message.value + "<br/>" + event.target.schedulingRequest.value;
      console.log(this);
      var test = PrivateMessages.insert(
        {
          fromID: Meteor.userId(),
          toID: this.item.ownerID,
          message: event.target.message.value,
          pickupTimeRequested: event.target.schedulingRequest.value,
          item: this.item._id,
          replies: [],
          notifyFromUser: false,
          notifyToUser: true,
          openThread: true
        });

      /*
>>>>>>> origin/master
      Meteor.call('sendEmail',
            (Meteor.users.findOne({_id : this.item.ownerID})).profile.email,
            Meteor.user().profile.email,
            'Request from TakeOut',
            messageContent);
<<<<<<< HEAD

         console.log(test);userId, doc, fieldNames, modifier
=======
       */
      Router.go('RequestSent');

      return false;
    },

    'change .filename': function (event) {
      Session.set('imageURL', event.originalEvent.fpfile.url);
    }
  });
  
  Template.Request.helpers({
    isItemStillAvailable: function(itemID)
    {
      console.log(itemID);
      return Items.findOne({ $and: [{ _id: itemID }, { pickupUserId: null }]}) != null;
    }
  });

	Template.ShowItems.helpers({
		items: function () {
			return Items.find({ pickupUserId: null });
		},

    itemsNearMe: function(){
      var lng = -122.1411802;
      var lat = 47.644823699999996;

      var results = Items.find( {
      loc:
        { $near :
          {
            $geometry:{ type:"Point", coordinates:[ lng, lat]},
            $minDistance: 0,
            $maxDistance: 5000
          }
       }
      });

      return results;
    }

	});

  Template.MyItems.helpers({
    items: function () {
      return Items.find({ ownerID: Meteor.userId() });
    }
  });
  
  Template.MyDonatedItems.helpers({
    items: function () {
      return Items.find({ $and: [{ ownerID: Meteor.userId() }, { pickupUserId: { $not: null } }] });
    }
  });
  
  Template.MyPickedUpItems.helpers({
    items: function () {
      return Items.find({ pickupUserId: Meteor.userId()});
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
};


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

Router.route('/MyDonatedItems', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context
  this.render('MyDonatedItems');
});

Router.route('/MyPickedUpItems', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context
  this.render('MyPickedUpItems');
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
      console.log(findResult);
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