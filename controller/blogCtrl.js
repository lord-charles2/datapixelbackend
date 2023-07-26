const Blog = require("../models/blogModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require("fs");

//AI CHECKED
const createBlog = async (req, res, next) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);
  } catch (error) {
    next(error);
  }
};

//AI CHECKED
const updateBlog = async (req, res, next) => {
  const { id } = req.params;

  // Validate that the ID is a valid MongoDB ID
  validateMongoDbId(id);

  try {
    // Find the blog by ID and update it with the request body
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // Send the updated blog as a JSON response
    res.json(updatedBlog);
  } catch (error) {
    // If there is an error, log it and send a 500 server error response
    next(error);
  }
};

//AI CHECKED
const getBlog = async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blog = await Blog.findById(id).populate("likes").populate("dislikes");
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

//AI CHECKED
const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

// Delete a blog post by id
const deleteBlog = async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);
    res.json(deletedBlog);
  } catch (error) {
    next(error);
  }
};

//AI CHECKED
const liketheBlog = async (req, res, next) => {
  try {
    // Extract the blog ID from the request body and validate it
    const { blogId } = req.body;
    validateMongoDbId(blogId);

    // Find the blog that needs to be liked
    const blog = await Blog.findById(blogId);

    // Find the ID of the logged-in user
    const loginUserId = req?.user?.userId;

    // Check if the user has already disliked the blog using includes
    const alreadyDisliked = blog?.dislikes?.includes(loginUserId);

    // Check if the user has already liked the blog
    const isLiked = blog?.isLiked;

    // Define the object that will be used to update the blog document in the database
    let updateObject = {};

    // Use a switch statement to determine the appropriate update to the blog document
    switch (true) {
      case alreadyDisliked:
        updateObject = {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
          isLiked: true,
          $push: { likes: loginUserId },
        };
        break;
      case isLiked:
        updateObject = {
          $pull: { likes: loginUserId },
          isLiked: false,
        };
        break;
      default:
        updateObject = {
          $push: { likes: loginUserId },
          isLiked: true,
        };
        break;
    }

    // Update the blog document in the database with the appropriate changes
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateObject, {
      new: true,
    });

    // Return the updated blog as a JSON response
    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

//AI CHECKED
const disliketheBlog = async (req, res) => {
  try {
    // Get the blogId from request body and validate it
    const { blogId } = req.body;
    validateMongoDbId(blogId);

    // Find the blog with the given blogId
    const blog = await Blog.findById(blogId);

    // Get the userId of the logged in user
    const { userId } = req.user || {};

    // Check if the user has already disliked the blog
    const isDisliked = blog.isDisliked;

    // Check if the user has already liked the blog
    const alreadyLiked = blog.likes?.includes(userId);

    // Define an empty updateObject which will be used to update the blog
    let updateObject = {};

    // Depending on whether the user has already liked or disliked the blog, update the blog
    switch (true) {
      case alreadyLiked:
        // If the user has already liked the blog, remove their like and add a dislike
        updateObject = {
          $pull: { likes: userId },
          isLiked: false,
          $push: { dislikes: userId },
          isDisliked: true,
        };
        break;
      case isDisliked:
        // If the user has already disliked the blog, remove their dislike
        updateObject = {
          $pull: { dislikes: userId },
          isDisliked: false,
        };
        break;
      default:
        // If the user hasn't liked or disliked the blog, add a dislike
        updateObject = {
          $push: { dislikes: userId },
          isDisliked: true,
        };
        break;
    }

    // Update the blog with the new data and return the updated blog
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateObject, {
      new: true,
    });
    res.json(updatedBlog);
  } catch (error) {
    // If an error occurs, log the error and send an error response to the client
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

//AI CHECKED
const uploadImages = async (req, res, next) => {
  const { id } = req.params; // extract the id from request params
  validateMongoDbId(id); // validate the id using a separate function

  try {
    // define an uploader function that uses cloudinary to upload an image
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = await Promise.all(
      // use Promise.all to parallelize image uploads
      req.files.map(async (file) => {
        // iterate through files and upload each image
        const { path } = file; // extract the file path
        const newpath = await uploader(path); // upload the image and get the URL
        fs.unlinkSync(path); // delete the temporary file from the server
        return newpath; // add the uploaded URL to the array
      })
    );
    // update the blog post with the uploaded image URLs
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      { images: urls },
      { new: true } // return the updated document
    );
    res.json(findBlog); // return the updated blog post
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  liketheBlog,
  disliketheBlog,
  uploadImages,
};
