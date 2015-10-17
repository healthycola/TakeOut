Items = new Mongo.Collection("items");

if (Meteor.isClient) {
	Template.additem.onRendered(function() {
		this.$('.datetimepicker').datetimepicker();
	});

	 Template.additem.events({
    	'submit #additem': function(event) {
			
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

    	Router.go('ShowItems');
		return false;
    }
  });

	Template.ShowItems.helpers({
		items: function () {
			return Items.find();
		}
	});
  
  Template.MyItems.helpers({
		items: function () {
			return Items.find({ownerID: Meteor.userId()});
		}
	});
  
  Template.item.events({
    	'click .itemRow': function(event) {
        console.log(this);
        Router.go('/items/' + this._id);
    }
  });
  
  Template.myItem.events({
    'click .delete': function(event) {
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

Router.route('/items/:_id', function () {
  this.layout('LayoutOne');
  var findResult = Items.findOne({_id: this.params._id});
  
  if (findResult)
  {
    var ownerFindResult = Meteor.users.findOne({_id: findResult.ownerID});
    if (ownerFindResult)
    {
      this.render('ShowSingleItem', {data: {item: findResult, owner: ownerFindResult}});
    }
    else
    {
      this.render('ShowSingleItem', {data: {}});
    }
  }
  else
  {
    this.render('ShowSingleItem', {data: {}});
  }
});



// Router.route('/items/:_id', function () {
//   var item = Items.findOne({_id: this.params._id});
//   this.render('ShowItem', {data: item});
// });