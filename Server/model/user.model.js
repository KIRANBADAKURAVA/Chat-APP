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
    profilePicture: {
        type: String,
        default: "https://www.google.com/imgres?q=profile%20pic%20logo%20url&imgurl=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fthumbnails%2F005%2F544%2F708%2Fsmall_2x%2Fprofile-icon-design-free-vector.jpg&imgrefurl=https%3A%2F%2Fwww.vecteezy.com%2Ffree-vector%2Fprofile-logo&docid=BJa5oBBmsPAcoM&tbnid=PjKoQco_oD_9cM&vet=12ahUKEwjqmtrrgbmKAxVkV2wGHX7YJX0QM3oFCIMBEAA..i&w=400&h=400&hcb=2&ved=2ahUKEwjqmtrrgbmKAxVkV2wGHX7YJX0QM3oFCIMBEAA",
    },
    refreshToken: {
        type: String,
    },
    chats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
        }
    ],
    isOnline: { 
        type: Boolean,
        default: false,
    },
    publicKey: {
        type: String,
        required: false,
    },
},
{
    timestamps: true,
});

    UserSchema.pre('save', async function (next) {
        if (!this.isModified('password')) {
            return next();
        }
        const encryptedpassword = await bcrypt.hash(this.password,10)
        //console.log(encryptedpassword);
        this.password = encryptedpassword
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
            process.env.REFRESH_TOKEN_SECRET,
            {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY, 
            })
            return RefreshToken;
        
        }
    
const User = mongoose.model('User', UserSchema);

export default User;