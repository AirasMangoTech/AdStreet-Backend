const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Counter = require("./counter");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  mailBody: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: false,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  blogCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogCategory",
    // required: true,
  },
  image: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
  },
  eventStartTime: {
    type: String,
  },
  eventEndTime: {
    type: String,
  },
  venue: {
    type: String,
  },
  status: {
    type: Boolean,
    //default: true,
  },
  type: {
    type: String,
    required: true,
  },
  event_type: {
    type: String,
  },
  offered_by: {
    type: String,
  },
  additional: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone_num: {
      type: String,
    },
    location: {
      type: String,
    },
    longitude: {
      type: String,
    },
    latitude: {
      type: String,
    },
    start_time: {
      type: String,
    },
    end_time: {
      type: String,
    },
    num_people: {
      type: Number,
    },
    link: {
      type: String,
    },
    f_link: {
      type: String,
    },
    t_link: {
      type: String,
    },
    l_link: {
      type: String,
    },
    w_link: {
      type: String,
    },
  },
  isApproved: {
    type: Boolean,
    default: null,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  logo: {
    type: String,
  },
  num_id: Number
});

blogSchema.pre("save", async function (next) {
  const blogs = this;
  if (!blogs.num_id && blogs.type.toLowerCase() == "adbook" ) {
    const counter = await Counter.findOneAndUpdate(
      { type: blogs.type },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    blogs.num_id = counter.seq;
  }
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
