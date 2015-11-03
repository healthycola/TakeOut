Items = new Mongo.Collection("items");

Meteor.users.allow({
  update: function (userId, doc, fieldNames, modifier) {
    // Allow everything for now.
    return true;
  }
});

addNewItem = function (
  _name,
  _ageDay,
  _ageHour,
  _imageURL,
  _ownerID,
  _pickupAfter,
  _pickupBefore,
  _latLng) {
  // Do some checks before adding
 
 /*   

    Meteor.call('deleteFile', "hahah", function(err,response) {
      if(err) {
        console.log("errr");
        return;
      }
      console.log("good");
    });
*/

  Items.insert(
    {
      name: _name,
      ageDay: _ageDay,
      ageHour: _ageHour,
      imageURL: _imageURL,
      ownerID: _ownerID,
      postedOn: new Date(),
      pickupAfter: _pickupAfter,
      pickupBefore: _pickupBefore,
      pickupUserId: null,
      loc: {
        type: "Point",
        coordinates: [_latLng.lng, _latLng.lat]
      }
    });
}



isAvailable = function (_itemID) {
  return Items.findOne({ $and: [{ _id: itemID }, { pickupUserId: null }]}) != null;
}

getAllAvailableItems = function () {
  return Items.find({ pickupUserId: null });
}

getItem = function (_itemID) {
  return Items.findOne({ _id: _itemID });
}

getAllItemsNearMe = function(_latLng) {
  Items.find( {
      loc:
        { $near :
          {
            $geometry:{ type:"Point", coordinates:[ _latLng.lng, _latLng.lat]},
            $minDistance: 0,
            $maxDistance: 5000
          }
       }
      }).fetch();
}

getAllItemsForAUser = function(_userID) {
  return Items.find({ ownerID: _userID });
}

getAllDonatedItemsForAUser = function(_userID) {
  return Items.find({ $and: [{ ownerID: _userID }, { pickupUserId: { $not: null } }] });
}

getAllPickedUpItemsForAUser = function(_userID) {
  return Items.find({ pickupUserId: _userID});
}

deleteItem = function(_itemID) {
  Items.remove(_itemID);
}