const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    adminId: { 
        type: Schema.Types.ObjectId ,
        ref: 'User'
    },
    members: [{
        type: Schema.Types.ObjectId ,
        ref: 'User'
    }],
    code: String
},{
    timestamps: true
});


module.exports = mongoose.model('Group',groupSchema);