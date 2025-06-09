const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel'); 



passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
     
      const user = await User.findOne({ email});
      
      if (!user || !await user.isPasswordMatched(password)) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      if(user.isBlock) {          
      const messages = `OOPS! your Account ${user.email} is blocked for your suspicious acitivity,Please contact our customer team  for further assistance`
      return done(null,false,{message:messages})
    }else{
      return done(null, user);
    }

   
  } catch (error) {
    return done(error);
  }
}
));


 
passport.serializeUser((user, done) => {
 
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
