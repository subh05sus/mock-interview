import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User";

export default function configurePassport() {
  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with the same email
          const email = profile.emails && profile.emails[0].value;
          if (email) {
            user = await User.findOne({ email });

            if (user) {
              // Update existing user with Google ID
              user.googleId = profile.id;
              user.avatar = user.avatar || profile.photos?.[0].value;
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          const newUser = new User({
            name: profile.displayName,
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0].value,
          });

          await newUser.save();
          done(null, newUser);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );

  // GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        callbackURL: "/api/auth/github/callback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Get email from GitHub profile
          const email = profile.emails && profile.emails[0].value;

          if (email) {
            user = await User.findOne({ email });

            if (user) {
              // Update existing user with GitHub ID
              user.githubId = profile.id;
              user.avatar = user.avatar || profile.photos?.[0].value;
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          const newUser = new User({
            name: profile.displayName || profile.username,
            email,
            githubId: profile.id,
            avatar: profile.photos?.[0].value,
          });

          await newUser.save();
          done(null, newUser);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
}
