const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        required: true
    },
    
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },

    class: {
        type: String,
        required: true
    },

    group: {
        type: String,
        enum: ['සීල', 'සමාධි', 'ප්‍රඥා', 'Unassigned'],
        default: 'Unassigned'
    },
    photo: { type: String },

    phone: {
        type: String,
        
    },
    dateOfBirth: {
        type:String,

    },
    address:{type:String}

}, {timestamps: true});

module.exports = mongoose.model("Student", studentSchema);
