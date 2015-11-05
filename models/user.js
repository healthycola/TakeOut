if (Meteor.isClient) {
	updateUsersAfterItemPickup = function (_fromUserId, _toUserId) {
		Meteor.users.update({ _id: _fromUserId }, { $inc: { "profile.itemsPickedUp": 1 } });
		Meteor.users.update({ _id: _toUserId }, { $inc: { "profile.itemsDonated": 1 } });
	}
	
	getUser = function(_userId) {
		Meteor.users.findOne({ _id: _userId })
	}
	
	isCurrentUser = function(_testUserId) {
		return _testUserId == Meteor.userId()
	}
}