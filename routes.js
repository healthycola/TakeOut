
Router.route('/', function () {
  
  this.layout('LayoutTwo');

  this.render('homepage');
});

Router.route('/signup', function () {
  
  this.layout('LayoutOne');

  this.render('signupstuff');
});

Router.route('/profile', function () {
  this.layout('LayoutOne');
  
  this.render('profile', {data: {user: Meteor.user() }});
});

Router.route('/users/:_id', function () {
  this.layout('LayoutOne');
  var findResult = Meteor.users.findOne({ _id: this.params._id });
  
  this.render('profile', {data: {user: findResult }});
});

Router.route('/feed', function () {
  this.layout('LayoutOne');
  
  this.render('feed');
});

Router.route('/additem', function () {
  this.layout('LayoutOne');
  
  this.render('additem');
});

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
  var findResult = getItem(this.params._id);

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
  
  if ((findResult != null) && (findResult.toID == Meteor.userId() || findResult.fromID == Meteor.userId()))
  {
    this.render('fullNotificationThread', { data: {notificationThread: findResult} }); 
  }
  else
  {
    this.render('fullNotificationThread', { data: {} });
  }
});

