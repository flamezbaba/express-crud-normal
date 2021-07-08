require("dotenv").config();
require("./config/database").connect();
const jwt = require("jsonwebtoken");
const express = require("express");
const auth = require("./middleware/auth");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// Logic goes here
const User = require("./model/user");

app.post("/register", async (req, res) => {
    try{
        const { firstName, lastName, email, password } = req.body;
        if(!(firstName && lastName && email && password)){
            res.status(409).send("All Input is required");
        }
        
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        const newUser = await User.create({
            first_name: firstName,
            last_name: lastName,
            email: email.toLowerCase(),
            password: password,
        });

        const token = jwt.sign(
            {user_id: newUser._id, email},
            process.env.TOKEN_KEY,
            {expiresIn: "5h" }
        );

        newUser.token = token;
        res.status(201).send(newUser);

    }
    catch(err){
        console.log(err);
    }
});

app.post("/login",  async (req, res)=>{

    try{
        const { email, password } = req.body;
        if(!(email && password)){
            res.status(409).send("Email & Password required");
        }

        const user = await User.findOne({ email });

        if(user){
            if(user.password === password){
                const token = jwt.sign(
                    {user_id: user._id, email},
                    process.env.TOKEN_KEY,
                    {expiresIn: "5h" }
                );

                user.token = token;
                res.status(200).send(user);
            }
            else{
                res.status(409).send(`Incorrect Password`); 
            }
        }
        else{
            res.status(409).send(`User with email ${email} Not Found`); 
        }
    }
    catch(err){
        console.log(err);
    }

});

app.get("/welcome", cors(), auth, (req, res) => {
    res.status(200).send("Welcome to My Test App 🙌");
});

module.exports = app;