const User = require("../Model/UserModel");
const Student = require("../Model/StudentModel");

const getAllUser = async (req, res, next)=> {
    let users;

    try{
        users = await User.find();
    }catch(err){
        console.log(err);
    }
    if(!users){
        return res.status(404).json({message:"No Users found"});
    }
    return res.status(200).json({ users });
};
const addUser = async (req, res, next) => {
    const { name, email, password, role, class: studentClass, group: studentGroup } = req.body;
    // multer will place file info on req.file if provided
    const file = req.file;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Prevent duplicate accounts by email
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "User already exists" });
        }

        const userData = { name, email, password, role };
        if (file) {
            // store public-accessible path
            userData.photo = `/uploads/${file.filename}`;
        }
        const user = new User(userData);
        await user.save();
        // If new user is a student, create a student profile so admin can see them
        let student = null;
        if (role === 'student') {
            // generate a simple unique roll number
            const genRoll = () => `RN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*900+100)}`;
            let rollNumber = genRoll();
            // ensure uniqueness (try a few times)
            for (let i = 0; i < 5; i++) {
                const dup = await Student.findOne({ rollNumber });
                if (!dup) break;
                rollNumber = genRoll();
            }

            try {
                student = new Student({
                    userId: user._id,
                    name: name,
                    email: email,
                    rollNumber: rollNumber,
                    class: studentClass || 'Unassigned',
                    group: studentGroup || 'Unassigned'
                });
                await student.save();
            } catch (sErr) {
                console.error('Failed to create student profile:', sErr);
            }
        }

        return res.status(201).json({ user, student });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unable to add user" });
    }
};

const getUserById = async (req, res, next) => {
    const id = req.params.id;
    let users;

    try{
        users = await User.findById(id);
    }catch(err){
        console.log(err);
    }
    if(!users){
        return res.status(404).json({message:"No User found"});
    }
    return res.status(200).json({ users });
};
const updateUser = async(req, res, next)=>{
    const id = req.params.id;
    const {name,email,password,role} = req.body;
    const file = req.file;

    try{
        const update = { };
        if (name) update.name = name;
        if (email) update.email = email;
        if (password) update.password = password;
        if (role) update.role = role;
        if (file) update.photo = `/uploads/${file.filename}`;

        const users = await User.findByIdAndUpdate(id, update, { new: true });
        if(!users){
            return res.status(404).json({message:"unable update user"});
        }

        // If this user has a student profile, keep student.photo in sync
        try {
          const student = await Student.findOne({ userId: users._id });
          if (student && update.photo) {
            await Student.findByIdAndUpdate(student._id, { photo: update.photo });
          }
        } catch (syncErr) {
          console.error('Failed to sync student photo:', syncErr);
        }

        return res.status(200).json({ users });
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Unable to update user' });
    }
};
const deleteUser = async(req, res, next) =>{
    const id = req.params.id;

    let users;

     try{
        users = await User.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
    }
    if(!users){
        return res.status(404).json({message:"unable delete user"});
    }
    return res.status(200).json({ users });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Login failed" });
    }
};



 exports.getAllUsers = getAllUser;
 exports.addUser = addUser;
 exports.getUserById = getUserById;
 exports.updateUser = updateUser;
 exports.deleteUser = deleteUser;
 exports.loginUser = loginUser;