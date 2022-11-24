const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const MongoUtil = require("./MongoUtil");

//set up express app
const app = express();
//enable json processing
app.use(express.json());
//enable cors
app.use(cors());

async function main() {
    await MongoUtil.connect(process.env.MONGO_URI, "tgc20-test");
    const db = MongoUtil.getDB();

    // app.get("/", function (req, res){
    //     res.send("helloworld")
    // })

    app.get("/brands", async function (req, res) {
        let response = await db.collection("brands").find().toArray();
        res.json(response);
    })

    app.post("/create-brand", async function (req, res) {
        let brandName = req.body.brandName;

        try {
            let response = await db.collection("brands").insertOne({
                brandName
            })
            res.status(200);
            res.json(response);
        } catch (e) {
            res.status(500);
            res.json({
                "message": "Internal server error. Please contact administrator"
            })
            console.log(e)
        }
    })

    app.get("/countries", async function (req, res) {
        let response = await db.collection("countries").find().toArray();
        res.json(response);
    })

    app.post("/create-country", async function (req, res) {
        let country = req.body.country;

        try {
            let response = await db.collection("countries").insertOne({
                country
            })
            res.status(200);
            res.json(response);
        } catch (e) {
            res.status(500);
            res.json({
                "message": "Internal server error. Please contact administrator"
            })
            console.log(e)
        }
    })
   
    // JOIN USING AGGREGATE
    // app.get("/listings", async function(req,res){
    //     let response = await db.collection("listings").aggregate([
    //         {
    //             $lookup: {
    //                 from: "brands",
    //                 localField: "brandId",
    //                 foreignField: "_id",
    //                 as: "brand",
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: "countries",
    //                 localField: "countryId",
    //                 foreignField: "_id",
    //                 as: "country",
    //             }
    //         }
    //     ]).toArray();
    //     res.json(response);
    // })

    // JOIN USING MANUAL JOIN
    app.get("/listings", async function (req, res) {
        try {
            let listingsResponse = await db.collection("listings").find().toArray();
            let brandsResponse = await db.collection("brands").find().toArray();
            let countriesResponse = await db.collection("countries").find().toArray();

            let listingsData = listingsResponse;
            // console.log(listingsData);
            let brandsData = brandsResponse;
            // console.log(brandsData);
            let countriesData = countriesResponse;
            // console.log(countriesData);

            for (let listing of listingsData) {
                let listingBrandId = (listing.brandId).toString();
                let listingCountryId = (listing.countryId).toString();

                // console.log(listingId);
                for (let brand of brandsData) {
                    let brandId = (brand._id).toString();
                    if (listingBrandId === brandId) {
                        listing.brand = brand.brandName;
                        break;
                    }
                }
                for (let country of countriesData) {
                    let countryId = (country._id).toString();
                    if (listingCountryId === countryId) {
                        listing.country = country.country;
                        break;
                    }
                }
            }

            res.status(200);
            res.json(listingsData);
        } catch (e) {
            res.status(500);
            res.json({
                "message": "Internal server error. Please contact administrator"
            })
            console.log(e)
        }
    })

    app.post("/create-listing", async function (req, res) {
        let name = req.body.name;
        let countryId = ObjectId(req.body.countryId);
        let brandId = ObjectId(req.body.brandId);

        try {
            let response = await db.collection("listings").insertOne({
                name,
                countryId,
                brandId
            })
            res.status(200);
            res.json(response);
        } catch (e) {
            res.status(500);
            res.json({
                "message": "Internal server error. Please contact administrator"
            })
            console.log(e)
        }
    })

}
main();

//open the listening port
app.listen(process.env.PORT, function () {
    console.log("server started")
})