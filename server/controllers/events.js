const Event = require('../models/event');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');

// @desc    Get all events
exports.getEvents = async (req, res, next) => {
  try {
    res.status(200).json(res.advancedResults);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name avatar');
    if (!event) return next(new ErrorResponse('Event not found', 404));

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Create event (Admin/Organizer only)
exports.createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user.id;
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Update event
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }
    
    // Verify user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this event', 401));
    }
    
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }
    
    // Verify user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this event', 401));
    }
    
    await event.remove();
    
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload photo for event
exports.uploadEventPhoto = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }
    
    // Verify user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this event', 401));
    }
    
    if (!req.files) {
      return next(new ErrorResponse('Please upload a file', 400));
    }
    
    const file = req.files.file;
    
    // Check file type
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }
    
    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`, 400));
    }
    
    // Create custom filename
    file.name = `photo_${event._id}${path.parse(file.name).ext}`;
    
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if (err) {
        return next(new ErrorResponse('Problem with file upload', 500));
      }
      
      await Event.findByIdAndUpdate(req.params.id, { photo: file.name });
      res.status(200).json({ success: true, data: file.name });
    });
  } catch (err) {
    next(err);
  }
};