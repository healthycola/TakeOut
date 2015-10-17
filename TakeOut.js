if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      console.log(Meteor.users);
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Template.signupForm.events({
    "submit #signup-form": function(event) {
      event.preventDefault();
      Accounts.createUser({
        username: event.target.signupusername.value,
        password: event.target.signuppassword.value,
        email: event.target.signupEmail.value,
        profile: {
          firstName: event.target.signupFirstName.value,
          lastName: event.target.signupLastName.value,
          accountType: event.target.accountType.value,
          itemsDonated: 0,
          itemsPickedUp: 0,
          signupDate: new Date()
        }
      }, function(error) {
        if (error) {
          // Display the user creation error to the user however you want
        }
      });
    }
  });

  Template.loginForm.events({
    "submit #login-form": function(event) {
      event.preventDefault();
      console.log(event);
      console.log("Test - " + event.target.loginusername.value);
      Meteor.loginWithPassword(
        event.target.loginusername.value,
        event.target.loginpassword.value,
        function(error) {
          if (error) {
            // Display the login error to the user however you want
          }
        }
      );
    }
  });

  Template.logoutForm.events({
    "click .logoutLink": function(event) {
      event.preventDefault();
      Meteor.logout(function(error) {
        if (error) {
          // Display the logout error to the user however you want
        }
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Router.route('/', function () {
  // render the Home template with a custom data context
  this.layout('LayoutOne');
  
  this.render('homepage');
});

Router.route('/signup', function () {
  // render the Home template with a custom data context
  this.layout('LayoutOne');
  
  this.render('signupstuff');
});

Router.route('/profile', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context
  this.render('profile');
});

Router.route('/additem', function () {
  this.layout('LayoutOne');
  // render the Home template with a custom data context
  this.render('additem');
});