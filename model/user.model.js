import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    chats:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
        }
    ]
    });

    UserSchema.pre('save', function (next) {
        if (!this.isModified('password')) {
            return next();
        }
        this.password = bcrypt.hashSync(this.password, 10);
            next();
        });

    UserSchema.methods.isPasswordCorrect= async function (password) {
        return bcrypt.compare(password, this.password);
    }

    UserSchema.methods.generateAccessToken = async function () {
        const accesstoken = await jwt.sign(
            {
                id: this._id,
            },
            process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,    
        })

            return accesstoken;
         }

    UserSchema.methods.generateRefreshToken = async function () {
        const RefreshToken = await jwt.sign(
            {
                id: this._id,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY, 
            })
            return RefreshToken;
        
        }
    
const User = mongoose.model('User', UserSchema);

export default User;