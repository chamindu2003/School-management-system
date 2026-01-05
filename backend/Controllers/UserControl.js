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
    const { name, email, password, role, class: studentClass } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Prevent duplicate accounts by email
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "User already exists" });
        }

        const user = new User({ name, email, password, role });
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
                    class: studentClass || 'Unassigned'
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

    let users;

    try{
        users = await User.findByIdAndUpdate(id,
            {name:name, email:email, password:password, role:role}
        );
    }catch(err){
        console.log(err);
    }
    if(!users){
        return res.status(404).json({message:"unable update user"});
    }
    return res.status(200).json({ users });
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