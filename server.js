// Express
const express=require('express');
const app=express();
const port=3002;
app.use(express.json());
app.use(express.static('./public'));

// body parser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded());

// .env
require('dotenv').config();

// postGreSQL
const { Client }=require('pg');
const client=new Client({
    database:'scarletForestDB',
    password:'postgres',
    user:'postgres',
    host:'localhost',
    port:5432,
});
client.connect();

// JWT
// bcrypt
const bcrypt=require('bcrypt');

// passport
const passport=require('passport');
const initializePassport =require('./passport-config');
initializePassport(passport,async email=>{
    try {
        let user=await client.query(`SELECT * FROM members WHERE member_email='${email}'`);
        return user.rows[0];
    } catch (error) {
        console.log('function error:',error);
    }
    
},async id=>{
    try {
        let user=await client.query(`SELECT * FROM members WHERE member_id=${id}`);
        return user.rows[0];
    } catch (error) {
        console.log('function error:',error);
    }
});

// Session
const session=require('express-session');
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
}))

app.use(passport.initialize());
app.use(passport.session());




// Starting page
app.get('/',async (req,res)=>{
    try {
        if(req.isAuthenticated()){
            res.redirect('/home');
        }else{
            res.render('index.ejs');
        }
        
    } catch (error) {
        res.redirect('/error');
    }
    
});

// Error page
app.get('/error',async (req,res)=>{
    res.render('Error.ejs');
});

// Log in and register pages
app.get('/login',async (req,res)=>{
try {
        if(req.isAuthenticated()){
            res.redirect('/home');
        }else{
            res.render('Login.ejs');
        }
        
    } catch (error) {
        res.redirect('/error')
    }
});
app.get('/register',async (req,res)=>{
try {
        if(req.isAuthenticated()){
            res.redirect('/home');
        }else{
            res.render('Register.ejs');
        }
        
    } catch (error) {
        res.redirect('/error');
    }
});
app.post('/register',async (req,res)=>{
    try {
        if(!req.isAuthenticated() && process.env.STATUS=='open'){
            // bcrypt hashing
        let hashedPassword=await bcrypt.hash(req.body.password,11);

        await client.query(`INSERT INTO members(member_name,member_email,member_password,member_joined)VALUES('${req.body.name}','${req.body.email}','${hashedPassword}',CURRENT_DATE);`);
        const newMember=await client.query(`SELECT * FROM members WHERE member_email='${req.body.email}'`);
        await client.query(`INSERT INTO member_description(member_id,description)VALUES(${newMember.rows[0].member_id},'empty')`);
        
        res.redirect('/');
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        console.log(error);
        res.redirect('/error');
    }

});
app.post('/login',passport.authenticate('local',{
    successRedirect:'/home',
    failureRedirect:'/login',
}));


// After sign in

// Main pages


// home
app.get('/home',async (req,res)=>{
try {
        if(req.isAuthenticated()){
            res.render('home.ejs',{user:req.user});
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
    }
});

// First big Part (profiles,icons,viws)

// Profiles
app.get('/profile',async (req,res)=>{
    try {
        if(req.isAuthenticated()){
            
            res.render('profile.ejs',{user:req.user,active:await client.query(`SELECT icon_path FROM member_icons WHERE icon_id=${req.user.member_icon}`)});
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

// Other profiles
app.get('/view/:id',async (req,res)=>{
    try {
        if(req.isAuthenticated()){
            const target=req.params.id;
            const targetInfo=await client.query(`SELECT member_icon,member_name,member_id FROM members where member_id=${req.params.id}`);
            res.render('views.ejs',{user:targetInfo.rows[0],active:await client.query(`SELECT icon_path FROM member_icons WHERE icon_id=${targetInfo.rows[0].member_icon}`)});
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

// edit profile
app.get('/edit-image',async (req,res)=>{
    try {
        if(req.isAuthenticated()){
            
            res.render('icons.ejs',{icons:await client.query(`SELECT * FROM member_icons`)});
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});
app.get('/target-icon/:id',async (req,res)=>{
    try {
        if(req.isAuthenticated()){
            
            await client.query(`UPDATE members SET member_icon=${req.params.id} WHERE member_id=${req.user.member_id}`)
            res.redirect('/profile');
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

// Description
app.get('/description/:id',async(req,res)=>{
     try {
        if(req.isAuthenticated()){
            
            const target=await client.query(`SELECT * FROM member_description WHERE member_id=${req.params.id}`);
            res.json(target.rows[0]);
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
})
app.post('/description',async(req,res)=>{
     try {
        if(req.isAuthenticated()){
            
            await client.query(`UPDATE member_description SET description='${req.body.description}' WHERE member_id=${req.user.member_id}`);
            res.redirect('/profile');
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

// user menu
app.get('/users',async(req,res)=>{
try {
        if(req.isAuthenticated()){
            const members=await client.query(`SELECT members.member_id,member_name,members.member_icon,icon_path FROM members JOIN member_icons ON members.member_icon=member_icons.icon_id ORDER BY members.member_id`);
            res.render('users.ejs',{data:members.rows});
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

// First big Part (profiles,icons,viws) END

// The first part is almost done.

// Reminder to include the activity of the users in their profiles.

// notes.

// This part does look good but I think that it way too early to tell. 

// Second Part(logs,forum)

// logs

// forum
app.get('/forum',async(req,res)=>{
    try {
        if(req.isAuthenticated()){
            const data=await client.query(`SELECT * FROM member_posts JOIN members ON member_posts.member_id=members.member_id ORDER BY post_id DESC`);
            res.render('postMenu.ejs',{data:data.rows});
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

app.get('/post/:id', async (req,res)=>{
    try {
        if(req.isAuthenticated()){
            const data=await client.query(`SELECT * FROM member_posts JOIN members ON member_posts.member_id=members.member_id JOIN member_icons ON members.member_icon=member_icons.icon_id WHERE post_id=${req.params.id}`);
            const replies=await client.query(`SELECT * FROM member_replies WHERE post_id=${req.params.id}`);
            
            res.render('post.ejs',{post:data.rows[0],replies:replies.rows});
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

app.post('/reply/:id',async(req,res)=>{
    try {
        if(req.isAuthenticated()){
            await client.query(`INSERT INTO member_replies(member_id,post_id,post_body,post_time)VALUES(${req.user.member_id},${req.params.id},'${req.body.reply}',CURRENT_TIMESTAMP)`);
            res.redirect(`/post/${req.params.id}`)
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

app.get('/poster',async(req,res)=>{
    try {
        if(req.isAuthenticated()){
            
            res.render('poster.ejs')
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

app.post('/poster',async(req,res)=>{
    try {
        if(req.isAuthenticated()){
            await client.query(`INSERT INTO member_posts(member_id,post_body,post_title,post_time)VALUES(${req.user.member_id},'${req.body.post}','${req.body.title}',CURRENT_TIME)`);
            res.redirect('/forum');
        }else{
            res.redirect('/');
        }
        
    } catch (error) {
        res.redirect('/error');
        console.log(error);
    }
});

// Second Part(logs,forum) END

// Okay we're almost there, I think that the forum and the logs look fine..

// The forum is very minimum, and the logs don't display anything of importance yet. 

// There is room for an upgrade in logs and there will be an update once users offer their feedback.

// Third Part(videos,files)... 

// (this might be hard.)

// videos. 

// End.
app.listen(port,(req,res)=>{
    console.log(`app is listening on port ${port}`);
});