import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../Mongoose/Schemas/localUserSchema.mjs";
import { comparePassword } from "../helper/forPassword.mjs";


passport.serializeUser((user,done)=>{
    console.log(`Serializer called`);
    done(null, user.id);
})

passport.deserializeUser(async(id,done)=>{
    console.log(`Deserializer called`);
    try{
        const findUser= await User.findById(id);
        done(null,findUser);
    }catch(err){
        done(err,null);
    }
})

export default passport.use(
    new Strategy({usernameField:"identifier"},async (identifier,password,done)=>{
        try{
            const findUser = await User.findOne({
                $or: [{ username: identifier }, { email: identifier }],
            });
            if(!findUser)return done(null, false, { message: "No user present with this username." });
            const isMatch =comparePassword(password, findUser.password);
            if (!isMatch) return done(null, false, { message: "Invalid credentials" });
            return done(null,findUser);
            }
            catch(err){
                return done(err,null);
            }
    })
)
