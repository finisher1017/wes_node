const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'A store name is required.'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now()
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'Please supply coordinates for your store.'
    }],
    address: {
      type: String,
      required: 'Please supply an address.'
    }
  },
  photo: String
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); //skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // find existing slugs with same name
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
  // TODO make more resilient so slugs are unique
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } }},
    { $sort: { count: -1 } }
  ]);
}

module.exports = mongoose.model('Store', storeSchema);