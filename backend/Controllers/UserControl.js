const User = require("../Model/UserModel");

const getAllUser = async (req, res, next)=> {
    let Users;

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
    const { name, email, password, role } = req.body;
    let users;

    try {
        users = new User({
            name,
            email,
            password,
            role
        });
        await users.save();
    } catch (err) {
        console.log(err);
    }
    if (!users) {
        return res.status(404).json({ message: "Unable to add user" });
    }
    return res.status(200).json({ users });
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
    const {name,gmail,password,role} = req.body;

    let users;

    try{
        users = await User.findByIdAndUpdate(id,
            {name:name, gmail:gmail, password:password, role:role}
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
    const {name,gmail,password,role} = req.body;

    let users;

     try{
        users = await User.findByIdAndDelete(id,
            {name:name, gmail:gmail, password:password, role:role}
        );
    }catch(err){
        console.log(err);
    }
    if(!users){
        return res.status(404).json({message:"unable delete user"});
    }
    return res.status(200).json({ users });
};



 exports.getAllUsers = getAllUser;
 exports.addUser = addUser;
 exports.getUserById = getUserById;
 exports.updateUser = updateUser;
 exports.deleteUser = deleteUser;