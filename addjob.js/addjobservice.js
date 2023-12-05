const express = require("express");
const AddJobModel = require("./addjobmodel.js");


const CreateAddJob = async (req, res) => {
  try {
    const { selectcareer, experience, Date, details, city, work } = req.body;
    const LastUser = await AddJobModel.findOne().sort({ _id: -1 }).exec();
    const id = LastUser ? LastUser.id + 1 : 1;
    const create = await AddJobModel.create({
      id: id,
      selectcareer: selectcareer,
      experience: experience,
      Date: Date,
      details: details,
      city: city,
      work: work,
    });
    await create.save();
    res
      .status(200)
      .send({ message: "Sucessfully Job IS Added!", sucess: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const AddJobDeleteAll = async (res) => {
  try {
    const deleteALL = await AddJobModel.deleteMany({}).exec();
    res.status(201).send({ message: "Sucessfully Deleted!", sucess: true });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
};

const AddJobDeleteOne = async (req, res) => {
  try {
    const id = { _id: req.params.id };

    const deleteone = await AddJobModel.findByIdAndDelete(id);
    res.status(201).send({ message: "Sucessfully Deleted!", sucess: true });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
};

const AddJobFindAll = async (res) => {
  try {
    const findall = await AddJobModel.find().exec();
    res.status(200).send({ sucess: true, data: { findall } });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
};

const AddJobUpdate = async (req, res) => {
  try {
    const { selectcareer, experience, Date, details } = req.body;
    const id = { _id: req.params.id };
    const addjobupdate = await AddJobModel.findByIdAndUpdate(id, {
      selectcareer: selectcareer,
      experience: experience,
      Date: Date,
      details: details,
    });
    res.status(200).send({ message: "Update Sucessfully!" });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
};

const AddJobGetone = async (req, res) => {
  try {
    const id = { _id: req.params.id };
    const addjobgetone = await AddJobModel.findById(id);
    res.status(200).send({ sucess: true, data: { addjobgetone } });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
};

const AddjobcountDocuments = async (req, res) => {
  try {
    const records = await AddJobModel.countDocuments();
    res.status(200).send({ records: records, success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

module.exports = {
  CreateAddJob,
  AddJobDeleteAll,
  AddJobDeleteOne,
  AddJobUpdate,
  AddJobFindAll,
  AddJobGetone,
  AddjobcountDocuments,
};
