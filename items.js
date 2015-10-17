Items = new Mongo.Collection("items");

if (Meteor.isClient) {
	Template.additem.onRendered(function() {
		this.$('.datetimepicker').datetimepicker();
	});
	
	 Template.additem.events({
    	'submit #additem': function(event) {
		var controller = Iron.controller();
		
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
		
		controller.layout('LayoutOne');
    	controller.render('ShowItems');
		
		return false;
    }
  });
  
	Template.ShowItems.helpers({
		items: function () {
			return Items.find();
		}
	});
};

Router.route('/ShowItems', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context
  this.render('ShowItems');
});

// Router.route('/items/:_id', function () {
//   var item = Items.findOne({_id: this.params._id});
//   this.render('ShowItem', {data: item});
// });