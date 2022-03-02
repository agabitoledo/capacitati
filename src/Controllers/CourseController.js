const db = require('../../config/db');
const fs = require('fs');

// Create Course
exports.post = (req, res) => {
  const body = req.body;
  db("courses").insert(body).then((data) => {
    console.log(data);
    res.status(201).send({
      ...body,
      id: data,
    });
  });
};

// Update Course
exports.put = async (req, res) => {
  let id = req.params.id;
  await db("courses").update(req.body).where({ idCourse: id });
  const updateUser = await db("courses").where({ idCourse: id });
  return res.status(200).json(...updateUser);
}

// Delete Course
exports.delete = (req, res) => {
  let id = req.params.id;
  db('courses').del().where({ idCourse: id }).then(() => {
    res.status(200).json({ message: "Deleted" });
  })
}

// Get Course List
exports.get = (req, res) => {
  db.select().table('courses').then(data => {
    res.status(200).send(JSON.stringify(data));
  });
}

// Get Course by Id
exports.getById = (req, res) => {
  let id = req.params.id;
  db.select().table('courses').where({ 'courseId': id })
    .then((data) => {
      if (data.length === 0) {
        return res.status(404).json({
          error: 'Course does not exist'
        });
      } else {
        res.status(200).send(data);
      }
    })
}

//Post video path 
exports.videoUpload = async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  await db('courses').where({ 'courseId': id }).first().update({ videoPath: req.file.path });
  res.send('uploaded successfully');

}

//Get Video
exports.getVideo = async (req, res) => {
  const { id } = req.params;
  const movieFile = await db('courses').where({ 'courseId': id }).first();
  console.log(movieFile.videoPath);

  fs.stat(movieFile.videoPath, (error, stats) => {
    if (error) { 
      console.log(error) 
      return res.status(404).end('<h1>Movie not found </h1>');
    }

    const {range} = req.headers;
    const {size} = stats;
    const start = Number((range || '').replace(/bytes=/, '').split('-')[0]);
    const end = size - 1;
    const chunkSize = (end - start) + 1;

    //definindo os headers de chunk
    res.set({
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });
    res.status(206);

    const stream = fs.createReadStream(movieFile.videoPath, {start, end});
    stream.on('open', () => stream.pipe(res));
    stream.on('error', (streamErr) => res.end(streamErr));
    return null;
  });
}