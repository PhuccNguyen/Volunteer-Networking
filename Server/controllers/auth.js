import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
// REGISTER USER
export const register = async (req, res) => {
    try {
        const {
            firstName, lastName,
            userName, mobile,
            email, intro,
            gender, birthday,
            status, password,
             friends,
            location, occupation
            } = req.body;

        const picturePath = req.file ? req.file.filename : null;
        console.log ("Receive Data: You Inputed :", req.body);  

        // Check if required fields are provided
        if (!firstName || !lastName || 
            !userName || !mobile || 
            !email || !intro || 
            !gender || !birthday || 
            !status || !password || 
            !location || !occupation) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the user already exists
        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
            });
        }

        const existingUser = await User.findOne({ $or: [{ userName }, { email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Use higher salt rounds for better security (12 is recommended minimum)
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName, lastName,
            userName, mobile,
            email, intro,
            gender, birthday,
            status,
            password: passwordHash,
            picturePath, friends,
            location, occupation,
        });
        const savedUser = await newUser.save();


            // Create JWT token including user role
    const token = jwt.sign(
        { id: savedUser._id, role: savedUser.role },  
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
      );

      
        res.status(201).json(savedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to register user" });
    }
};



export const login = async (req, res) => {
    try {
      const { identifier, password } = req.body;
  
      // Find the user by email, mobile or username
      const user = await User.findOne({ 
        $or: [{ email: identifier }, { mobile: identifier }, { userName: identifier }]
      });
  
      if (!user) {
        return res.status(404).json({ msg: "User does not exist!" });
      }
  
      // Check if the account is active
      if (!user.isActive) {
        return res.status(403).json({ msg: "Your account has been banned for violating platform policies. Please contact support." });
     }

      // Check if the password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
  
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
  
      // Create JWT token including user role
      const token = jwt.sign(
        { id: user._id, role: user.role },
         process.env.JWT_SECRET,
        { expiresIn: '12h' });
  
      // Remove password before returning user data
      const { password: _, ...userWithoutPassword } = user.toObject();
      
      // Send token and user info in the response
      res.status(200).json({ token, user: userWithoutPassword });
  
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
//   // Create JWT token including user role
// const token = jwt.sign(
//     { id: user._id, role: user.role },  // Make sure 'role' is included in the token
//     process.env.JWT_SECRET, 
//     { expiresIn: '5h' }
//   );
  