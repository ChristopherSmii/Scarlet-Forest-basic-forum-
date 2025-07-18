const { authenticate } = require('passport');
const bcrypt=require('bcrypt');

const LocalStrategy=require('passport-local').Strategy;


async function initialize(passport,getUserByEmail,getUserById){
    const authenticateUser=async (email,password,done)=>{
        const user=await getUserByEmail(email);
        if(user==null){
           return done(null,false,{message:'Site is closed.'});
        }

        try {
            if(await bcrypt.compare(password,user.member_password)){
                return done(null,user);
            }else{
                return done(null,false,{message:'Site is closed.'});
            }
        } catch (error) {
            return done({message:'Site is closed.'});
        }
    }
    passport.use(new LocalStrategy({usernameField:'email'},authenticateUser));
    passport.serializeUser((user,done)=>done(null,user.member_id))
    passport.deserializeUser(async (id,done)=>{
        const user = await getUserById(id);         
      return done(null, user);

    })
}

module.exports=initialize;
