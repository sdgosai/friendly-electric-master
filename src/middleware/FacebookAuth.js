const User = require('../Models/FacebookModel')
const facebookStrategy = require('passport-facebook').Strategy

module.exports = (passport) => {
    passport.use(new facebookStrategy({

        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret,
        callbackURL: process.env.callbackURL,
        profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']

    },
        function (token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                User.findOne({ 'uid': profile.id }, function (err, user) {

                    if (err)
                        return done(err);

                    if (user) {
                        console.log("user found")
                        return done(null, user);
                    } else {
                        var newUser = new User();

                        newUser.uid = profile.id;
                        newUser.token = token;
                        newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.email = profile.emails[0].value;
                        newUser.pic = profile.photos[0].value
                        newUser.save(function (err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });
                    }

                });

            })

        }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

}