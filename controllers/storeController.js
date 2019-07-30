const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    console.log("A file is in the filter");
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      console.log("This is a photo");
      next(null, true);
    } else {
      next({message: 'File type is not allowed'}, false);
    }
  }
  
}

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // Check if there is no new file to resize
  if (!req.file) {
    console.log("There is no file");
    next(); // Skip to the next middleware
    return;
  }
  if(req.file) {
    console.log("It exists");
  } else {
    console.log("It doesn't exist");
  }
  console.log(req.file);
};

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name}`)
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
  // query database for list of stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
  // 1. Find the store given the id
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm they are the owner of the store
  // TODO
  // Render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store });
  
}

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  req.body.location.type = 'Point';
  // Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // Return the new store instead of the old one
    runValidators: true
  }).exec();
  // Redirect them to the store and tell them it worked
  req.flash('success', `Successfully update <strong>${store.name}</strong>. 
            <a href=/stores/${store.slug}'>View Store</a>`);
  res.redirect(`/store/${store._id}/edit`);
  
}