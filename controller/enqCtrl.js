const Enquiry = require("../models/enqModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createEnquiry = asyncHandler(async (req, res) => {
  const newEnquiry = await Enquiry.create(req.body);
  res.json(newEnquiry);
});
const updateEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.json(updatedEnquiry);
});
const deleteEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const deletedEnquiry = await Enquiry.findByIdAndDelete(id);
  res.json(deletedEnquiry);
});
const getEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const getaEnquiry = await Enquiry.findById(id);
  res.json(getaEnquiry);
});
const getallEnquiry = asyncHandler(async (req, res) => {
  const getallEnquiry = await Enquiry.find();
  res.json(getallEnquiry);
});
module.exports = {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getallEnquiry,
};
