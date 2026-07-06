const Listing=require("../models/listing.js");
const { cloudinary } = require("../cloudconfig");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});
module.exports.index=async(req,res)=>{
    const allListings=await Listing.find();
    res.render("listings/index.ejs",{allListings});
  
}

module.exports.renderNewForm=(req,res)=>{
     res.render("listings/new.ejs");
}

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",
        populate:{
            path:"author",
        }
    }).populate("owner");
    if(!listing)
    {
        req.flash('error',"Listing Does Not Exist");
        return res.redirect("/listings");
    }
    console.log(listing);
        res.render("listings/show.ejs",{listing});
};
module.exports.createListing=async(req,res,next)=>{
    let response=await geocodingClient.forwardGeocode({
            query: req.body.location,
            limit: 1
        })
        .send()

        let {title,description,image,price,location,country}=req.body;
        console.log(req.body);
        let newListing=new Listing({
            title:title,
            description:description,
            // image:image,
        price:price,
        location:location,
        country:country
    });
    newListing.owner=req.user._id;
    if(typeof req.file!=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
    newListing.image={url,filename}
    }
    newListing.geometry=response.body.features[0].geometry;
    
let savedListing=await newListing.save();
console.log(savedListing)
    console.log("Listing was saved");
    req.flash('success','Listing Added Successfully');
    res.redirect("/listings");
    
}
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
     if(!listing)
    {
        req.flash('error',"Listing Does Not Exist");
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl})

}
module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,req.body);
    if(typeof req.file!=="undefined"){
    await cloudinary.uploader.destroy(listing.image.filename);
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save()
    }
    req.flash('success','Listing Updated');
   res.redirect(`/listings/${id}`);
}
module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndDelete(id);
    if (listing?.image?.filename && listing.image.filename !== "listingimage") {
        await cloudinary.uploader.destroy(listing.image.filename);
    }
        req.flash('success','Listing Deleted');
    res.redirect("/listings");
    
}