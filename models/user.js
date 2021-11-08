const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    name: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    groups: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", User);
