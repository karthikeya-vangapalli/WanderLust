const express=require('express');
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js")

const listingController=require("../controllers/listings.js");

const multer  = require('multer')
const {storage}=require("../cloudconfig.js");
// const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage })
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

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single('image[url]'),validateListing,wrapAsync(listingController.createListing));
    // .post((req,res)=>{
        
        // res.send(req.file)})
// router.get("/",wrapAsync(listingController.index)).get("/new",isLoggedIn,listingController.renderNewForm);
router.get("/new",isLoggedIn,listingController.renderNewForm);
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn,isOwner,upload.single('image[url]'),validateListing,wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));
// router.get("/:id",wrapAsync(listingController.showListing));
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));










// router.post("/",isLoggedIn,validateListing,wrapAsync(listingController.createListing));
// router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing));
// router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));


// router.post("/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
//     let listing=await Listing.findById(req.params.id);
//     let newReview=new Review(req.body.review);
//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();
//     res.redirect(`/listings/${listing._id}`);
 
// }));
// router.delete("/:id/reviews/:reviewId",wrapAsync(async(req,res,next)=>{
//     let {id,reviewId}=req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }));
module.exports=router;