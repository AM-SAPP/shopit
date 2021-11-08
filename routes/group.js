const express = require("express");
const Groups = require('../models/group');
const User = require('../models/user');
const jwt_decode = require('jwt-decode');
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const groupRouter = express.Router();
const {validateToken} = require("../authenticate");
 
groupRouter.use(express.json());
groupRouter.use(express.urlencoded({extended: true}));
groupRouter.use(cookieParser());


groupRouter.route('/')
    .get((req,res,next)=>{
        const decoded = jwt_decode(req.cookies['access-token-myntra']);
        const userId = decoded.id;
        User.findById(userId)
            .populate("groups")
            .then((user)=>{
                const groups = user.groups.map((group)=>{
                    return group.name;
                })
                res.status(200).header('Content-Types','Application/json').json(groups);
            })
            .catch((err)=>{
                res.status(400).json(err);
            })

    })
    .post(validateToken,(req,res,next)=>{
        const decoded = jwt_decode(req.cookies['access-token-myntra']);
        const userId = decoded.id;
        if(!userId){
            res.status(400).json("Login to the website");
        }
        const {name , code } = req.body;

        bcrypt.hash(code,10)
            .then((hash)=>{
                Groups.create({
                    name: name,
                    code: hash,
                    adminId: userId
                })
                .then((group)=>{
                        group.members.push(userId)
                        group.save((err,result)=>{
                            if(err){
                                res.status(400).json(err);
                            }
                            else{
                                User.findById(userId)
                                    .then((user)=>{
                                        user.groups.push(group._id);
                                        user.save()
                                            .then(()=>{
                                                res.status(200).json("Group created successfully")
                                            })
                                            .catch((err)=>{
                                                res.status(400).json(err);
                                            })
                                    })
                                    .catch((err)=>{
                                        res.status(400).json(err);
                                    })
                                
                            }
                        })
                })
                .catch((err)=>{
                    res.status(400).json(err);
                })
            })
    })
    

groupRouter.route('/:groupId')
    .get(validateToken,(req,res,next)=>{
        Groups.findById(req.params.groupId)
            .populate("adminId")
            .then((group)=>{
                res.status(200).header('Content-Types','Application/json').json(group);
            })
            .catch((err)=>{
                res.status(400).json(err);
            })
    })
    .post((req,res,next)=>{
        res.status(400).json("Post operation is not allowed");
    })
    .put((req,res,next)=>{
        res.status(400).json("PUT operation is not allowed");
    })
    .delete(validateToken,(req,res,next)=>{
        const decoded = jwt_decode(req.cookies['access-token-myntra']);
        const userId = decoded.id;
        Groups.findOne({$and : [{_id: req.params.groupId},{adminId : userId}]})
            .then((group)=>{
                if(!group){
                    res.status(400).json("You are not admin of this group");
                }
                group.members.forEach((memberid)=>{
                    User.findById(memberid)
                        .then((user)=>{
                            user.groups = user.groups.filter((groupid)=>{
                                return groupid.toString() !== group._id.toString();
                            })
                            user.save();
                        })
                })

                group.deleteOne({$and : [{_id: req.params.groupId},{adminId : userId}]})
                    .then((result)=>{
                        res.status(200).json(result);
                    })
                    .catch((err)=>{
                        res.status(400).json(err);
                    })
            })
            .catch((err)=>{
                res.status(400).json(err);
            })
    })

groupRouter.get('/:groupId/leave',validateToken,(req,res,next)=>{
        const decoded = jwt_decode(req.cookies['access-token-myntra']);
        const userId = decoded.id;
        Groups.findById(req.params.groupId)
            .then((group)=>{
                group.members = group.members.filter((memberid)=>{
                    return userId.toString() !== memberid.toString();
                })
                group.save((err,result)=>{
                    if(err){
                        return res.status(400).json(err);
                    }
                    else{
                        User.findById(userId)
                            .then((user)=>{
                                user.groups = user.groups.filter((groupid)=>{
                                    return groupid.toString() !== group._id.toString();
                                })
                                user.save()
                                    .then(()=>{
                                        return res.status(200).json("Leaving the group");
                                    })
                                    .catch((err)=>{
                                        res.status(200).json(err);
                                    })
                            })
                            .catch((err)=>{
                                res.status(400).json(err);
                            })
                    }
                })
            })
    })

    groupRouter.route('/:groupId/join')
        .post(validateToken,(req,res,next)=>{
        const decoded = jwt_decode(req.cookies['access-token-myntra']);
        const userId = decoded.id;
        const {code} = req.body;
         Groups.findById(req.params.groupId)
            .then((group)=>{
                bcrypt.compare(code,group.code).then((match)=>{
                    if(!match){
                        res.status(400).json({ error: "Wrong Code" });
                    }
                    else{
                        group.members.push(userId);
                        group.save((err,result)=>{
                            if(err){
                                res.status(400).json(err);
                            }
                            else{
                                User.findById(userId)
                                    .then((user)=>{
                                    user.groups.push(group._id);
                                    user.save()
                                        .then(()=>{
                                            res.status(200).json("Added to the group successfully");
                                        })
                                        .catch((err)=>{
                                            res.status(200).json(err);
                                        })
                                    })
                                    .catch((err)=>{
                                        res.status(400).json(err);
                                    })
                                
                            }
                        })
                    }
                })
            })
            .catch((err)=>{
                res.status(400).json(err);
            })
    })

    groupRouter.get("/:groupId/members",validateToken,(req,res)=>{
        Groups.findById(req.params.groupId)
            .populate("members")
            .then((group)=>{
                const members = group.members.map((member)=>{
                    return member.name;
                })
                res.status(200).header('Content-Types','Application/json').json(members);
            })
            .catch((err)=>{
                res.status(400).json(err);
            })
    })

    

module.exports = groupRouter;