if(process.env_NODE_ENV!=="production")
{
    require('dotenv').config()
}
const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path=require('path');
const Listing=require("./models/listing.js");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");
const session=require("express-session");
const MongoStore = require('connect-mongo').default;
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const listingRouter=require('./routes/listing.js');
const reviewRouter=require('./routes/review.js');
const userRouter=require('./routes/user.js');


app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL
main().then(()=>{
    console.log("connection successfull");
}).catch((err)=>{
    console.log(err);
})
async function main()
{
    await mongoose.connect(dbUrl);
}
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("Error in mongo sessions store",err);
})
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000
    }
};
// app.get("/",(req,res)=>{
//     res.send("root Working");
// })
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currUser=req.user;
    next();
});
app.get("/demo",async(req,res)=>{
    let  demoUser=new User({
        email:"abc@gmail.com",
        username:"abc"
    });
    let newUser=await User.register(demoUser,"abc@123");
    res.send(newUser);
})
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all('/{*splat}',(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})
app.use((err,req,res,next)=>{
    let {status=500,message="something Went wrong"}=err;
        res.status(status).render("listings/error.ejs",{message});
    // res.status(status).send(message); 
    
})
app.listen(3000,()=>{
    console.log(`app is started and running on port 3000`);
})












// ------------------------------------------------------------
// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My new Villa",
//         descrpition:"By the Beach",
//         price:1200,
//         location:"Calangute ,Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfull testing");
// });


// const validateListing=(req,res,next)=>{
//     let {error}=listingSchema.validate(req.body);
//         if(error)
//         {   let errMsg=error.details.map((el)=>el.message).join(","); 
//             throw new ExpressError(400,errMsg);
//         }
//         else{
//             next();
//         }
// }
// const validateReview=(req,res,next)=>{
//     let {error}=reviewSchema.validate(req.body);
//         if(error)
//         {   let errMsg=error.details.map((el)=>el.message).join(","); 
//             console.log(errMsg);
//             throw new ExpressError(400,errMsg);
//         }
//         else{
//             next();
//         }
// }
// app.use("/listings",listing);
// app.use("/listings/:id/reviews",review);
// app.get("/listings",wrapAsync(async(req,res)=>{
//     const allListings=await Listing.find();
//         res.render("listings/index.ejs",{allListings});

    
// }));
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs");
// });

// app.get("/listings/:id",wrapAsync(async(req,res)=>{
//     let {id}=req.params;
//     const listing=await Listing.findById(id).populate("reviews");
//         res.render("listings/show.ejs",{listing});
// }));
// app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
//     let {id}=req.params;
//     const listing=await Listing.findById(id);
//     res.render("listings/edit.ejs",{listing})

// }));
// app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
        
//         let {title,description,image,price,location,country}=req.body;
//         console.log(req.body);
//         let newListing=new Listing({
//             title:title,
//             description:description,
//             image:image,
//         price:price,
//         location:location,
//         country:country
//     });
//     await newListing.save();
//     console.log("Listing was saved");
//     res.redirect("/listings");
    
// }));
// app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    
//     let {id}=req.params;
//    await Listing.findByIdAndUpdate(id,req.body);
//    res.redirect(`/listings/${id}`);
// }));
// app.delete("/listings/:id",wrapAsync(async(req,res)=>{
//     let {id}=req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// }));
// app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
//     let listing=await Listing.findById(req.params.id);
//     let newReview=new Review(req.body.review);
//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();
//     res.redirect(`/listings/${listing._id}`);
 
// }));
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res,next)=>{
//     let {id,reviewId}=req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }));