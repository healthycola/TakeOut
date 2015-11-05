PrivateMessages = new Mongo.Collection("pms");

if (Meteor.isClient) {
	getAllNotificationsForUser = function(_userId) {
		return PrivateMessages.find({ $or: [{ $and: [{toID: _userId}, {notifyToUser: true}] }, { $and: [{fromID: _userId}, {notifyFromUser: true}] } ] }).fetch();
	}
	
	getRequestedNotifications = function(_userId) {
		return PrivateMessages.find({ fromID: _userId }).fetch();
	}
	
	getRequestsNotifications = function(_userId) {
		return PrivateMessages.find({ toID: _userId }).fetch();
	}
	
	getActiveNotifications = function (_userId) {
		return PrivateMessages.find({ $or: [{ $and: [{toID: _userId}, {notifyToUser: true}] }, { $and: [{fromID: Meteor.userId()}, {notifyFromUser: true}] } ] }).fetch();
	}
	
	getPendingRequestNotifications = function (_userId) {
		return PrivateMessages.find({$and: [{ $or: [ {toID: _userId}, {fromID: _userId } ] }, {pickupComplete : false}] }).fetch();
	}
	
	getPendingRequestNotifications = function (_userId) {
		return PrivateMessages.find({$and: [{ $or: [ {toID: _userId}, {fromID: _userId } ] }, {pickupComplete : false}] }).fetch();
	}
	
	closeThread = function closeThread(_notification) {
		PrivateMessages.update({ _id: _notification._id }, { $set: { openThread: false } });
		dismissNotification(_notification);
	}
	
	dismissNotification = function (notification) {
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

	addReply = function(_notification, _reply)
	{
		if (_notification.fromID == Meteor.userId())
		{
			PrivateMessages.update({_id: _notification._id}, { $push: { replies: {message: _reply, time: new Date(), fromID: Meteor.userId() } }, $set: { notifyToUser: true} });
		}
		else if (_notification.toID == Meteor.userId())
		{
			PrivateMessages.update({_id: _notification._id}, { $push: { replies: {message: _reply, time: new Date(), fromID: Meteor.userId() } }, $set: { notifyFromUser: true} });
		}
	}
}