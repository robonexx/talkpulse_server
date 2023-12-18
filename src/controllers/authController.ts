import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { assertDefined } from "../utils/asserts";
import verifyEmail from "helpers/Email";

export const signUp = async (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    try {
        if (await User.findOne({username: username})) {
            return res.status(400).json({ message: "Username already taken, try an other" });
        }

        if (await User.findOne({email: email})) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const user = new User({ username: username, password, email })
        await user.save()

        res.status(201).json({ username, id: user._id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logIn = async (req: Request, res: Response) => {
    console.log(req.userId);
    try {
        // Ta in användarnamn och lösen
        const { username, password } = req.body;

        // Hitta en användare
        const user = await User.findOne({username: username}, '+password');

        // Kolla att vi har en användare och om lösenordet matchar det i databasen.
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: 'Wrong username or password' });
        }
        
        assertDefined(process.env.JWT_SECRET)
        
        // Returnera JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        assertDefined(process.env.REFRESH_TOKEN_SECRET)

        // Returnera refreshtoekn
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });


        res.status(200).json({token, refreshToken, username: user.username})
    } catch (error) {
        console.log("Error in login", error);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

export const refreshJWT = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret ) {
        throw Error('Missing REFRESH_TOKEN_SECRET');
    }

    try {
    // Returnera refreshtoekn
    const decodedPayload = await jwt.verify(refreshToken, refreshTokenSecret) as {userId: string};  

    assertDefined(process.env.JWT_SECRET)
    
    // Returnera JWT
    const token = jwt.sign({ userId: decodedPayload.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({
        token
    })
    } catch(error) {
        console.log(error)
        return res.status(403).json({message: 'Invalid token'})
    }   
}  


// up next
export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = req

    const user = await User.findById(userId);

    if (!user) {
        console.log("User not found with id: ", userId)
        return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json({
        username: user.username,
        email: user.email,
        password: user.password
    })
}