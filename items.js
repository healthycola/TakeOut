

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
  var imageUrlsSoFar = [];

  Template.additem.helpers({
    imageURL: function () {
      return Session.get('imageURL');
    },
    imageUploadProgress: function () {
      if (Session.get('fileProgress')){
        return Session.get('fileProgress');
      }

      return 0;
    },
    getUploaded: function () {
      return Session.get('uploadedImageUrls'); 
    }
  });

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

  var addItem = function (event) {
    var latLng = Geolocation.latLng();

    if (!latLng) {
      latLng = {};
      latLng.lng = 0;
      latLng.lat = 0;
    }

    Session.set("device-lat", latLng.lat);
    Session.set("device-lng", latLng.lng);

    if(!Session.get('uploadedImageUrls')){
      Session.set('uploadedImageUrls', '');
    }

    addNewItem(
      event.target.name.value,
      event.target.ageInDays.value,
      event.target.ageInHours.value,
      Session.get('uploadedImageUrls'),
      Meteor.userId(),
      event.target.schedulingAfter.value,
      event.target.schedulingBefore.value,
      latLng);

    Session.set('imageURL', '');
    Router.go('ShowItems');
  };

  Template.additem.events({
 

    'submit #additem': function (event) {
      addItem(event);
      return false;
    },

    'change .filename': function (event) {
      Session.set('imageURL', event.originalEvent.fpfile.url);
    },

    'change #fileUpload': function (event){

      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4();
      }

      var filesInput = document.getElementById('fileUpload');
      var files = filesInput.files;
      var i = 0;
      var len = files.length;
      var guid = guid();
      var uploadedSoFar = 0;
      var filesNotUploaded = 0;
      console.log(imageUrlsSoFar);
      

      for (; i < len; i++) {
        $("#imagesStillLoading").show();
        $("#addItemSubmitButton").prop("disabled", true);
        console.log("Filename: " + files[i].name);
        console.log("Type: " + files[i].type);
        console.log("Size: " + files[i].size + " bytes");
        console.log(guid);

        var options = {};
        options.params = [{name: guid + files[i].name}];
        AzureFile.upload(files[i],"uploadFile",options,function(err,success)
        {
          if (err){
            filesNotUploaded++;
            if((uploadedSoFar+filesNotUploaded) == len){
              console.log("done all uploads");
              $("#imagesStillLoading").hide();
              $("#addItemSubmitButton").prop("disabled", false);
            }

            throw err
          }
          else{
            //file upload was succesful
            uploadedSoFar++;
            console.log(success);
            console.log(len);
            imageUrlsSoFar.push("https://lendimgstorage.blob.core.windows.net/takeoutblobimage/"+guid+success.name);
            console.log(imageUrlsSoFar);
            console.log(uploadedSoFar);
            Session.set('uploadedImageUrls', imageUrlsSoFar)
            if((uploadedSoFar+filesNotUploaded) == len){
              console.log("done all uploads");
              $("#imagesStillLoading").hide();
              $("#addItemSubmitButton").prop("disabled", false);
            }
          }                       
        });
      }
    }
  });

  var onRequestRendered = function (item) {
    $('.datetimepicker').datetimepicker({
      minDate: new Date(item.pickupAfter),
      maxDate: new Date(item.pickupBefore)
    });
  };

  Template.Request.onRendered(function () {
    onRequestRendered(this.data.item);
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
    isItemStillAvailable: function (itemID) {
      return isAvailable(itemID);
    }
  });

  Template.ShowItems.helpers({
    items: function () {
      return getAllAvailableItems();
    },

    itemsNearMe: function () {
      return getAllItemsNearMe({ lat: 47.644823699999996, lng: -122.1411802 });
    }

  });

  Template.MyItems.helpers({
    items: function () {
      return getAllItemsForAUser(Meteor.userId());
    }
  });

  Template.MyDonatedItems.helpers({
    items: function () {
      return getAllDonatedItemsForAUser(Meteor.userId());
    }
  });

  Template.MyPickedUpItems.helpers({
    items: function () {
      getAllPickedUpItemsForAUser(Meteor.userId());
    }
  });

  Template.item.events({
    'click .itemClick': function (event) {
      Router.go('/items/' + this._id);
    }
  });

  Template.myItem.events({
    'click .delete': function (event) {
      deleteItem(this._id);
    }
  });
};