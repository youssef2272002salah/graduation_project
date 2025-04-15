import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { UserModel } from "../modules/users/user.model";
import { signToken } from "../utils/jwt";
import dotenv from "dotenv";

dotenv.config();

const authCallback = async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      console.log("Facebook Profile:", profile); // ✅ Debugging
  
      const email = profile.emails?.[0]?.value;
      const fullname =
        profile.displayName || // ✅ Use displayName if available
        `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() || // ✅ Try given & family name
        "Anonymous User"; // ✅ Fallback
  
      if (!fullname.trim()) {
        return done(null, false, { message: "Please add a name" });
      }
  
      let user = await UserModel.findOne({ email });
  
      if (!user) {
        user = await UserModel.create({
          fullname,
          email,
          providerId: profile.id,
          provider: profile.provider,
          role: "user",
          isVerified: true,
        });
      }
  
      const token = signToken(user._id.toString());
      return done(null, { user, token });
    } catch (error) {
      return done(error, null);
    }
  };
  

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    authCallback
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
        profileFields: ["id", "displayName", "name", "emails"],
    },
    authCallback
  )
);
