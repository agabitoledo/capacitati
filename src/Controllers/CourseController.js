const db = require('../../config/db');
const fs = require('fs');
const { json } = require("express/lib/response");

exports.createCourse = (req, res) => {
  const body = req.body;
  db("courses").insert(body).then((data) => {
    console.log(data);
    res.status(201).send({
      ...body,
      courseId: data,
    });
  });
};

exports.updateCourse = async (req, res) => {
  let id = req.params.id;
  await db("courses").update(req.body).where({ courseId: id });
  const updateUser = await db("courses").where({ courseId: id });
  return res.status(200).json(...updateUser);
}

exports.deleteCourse = (req, res) => {
  let id = req.params.id;
  db('courses').del().where({ courseId: id }).then(() => {
    res.status(200).json({ message: "Deleted" });
  })
}

exports.getCourseList = (req, res) => {
  db.select().table('courses').then(data => {
    res.status(200).send(JSON.stringify(data));
  });
}

exports.getCourseById = (req, res) => {
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

exports.createVideoClass = async (req, res) => {
  const { body } = req;
  db('videos').insert({ ...body, videoId: `${body.courseIdRefVideos}-${body.classNumber}` }).then((data) => {
    console.log('data', data);
    res.status(201).send({
      ...body,
      videoId: `${body.courseIdRefVideos}-${body.classNumber}`,
    });
  });
};

exports.getListClass = async (req, res) => {
  const { courseId } = req.params;
  await db('videos').where({ 'courseIdRefVideos': courseId }).then((data) => {
    if (data.length === 0) {
      return res.status(400).json({ error: 'course does not exist or is empty' });
    }
    // const sortedData = data.sort((a, b) => (
    //   a.number >= b.number ? 1 : -1
    // ));
    // return res.status(200).send(sortedData);
  })
};

exports.getCLass = async (req, res) => {
  const { courseId, classNumber } = req.params;

  await db('videos').where({ courseIdRefVideos: courseId, classNumber }).first().then((data) => {
    if (data.length === 0) {
      return res.status(400).json({ error: 'class does not exist' })
    }
    return res.status(200).send(data)
  })
}

exports.videoPathUpload = async (req, res, next) => {
  console.log(req.params);
  const { courseId, classNumber } = req.params;
  await db('videos').where({ courseIdRefVideos: courseId, classNumber: classNumber }).first().update({ videoPath: req.file.path });
  res.send('uploaded successfully');
}

exports.getVideo = async (req, res) => {
  const { courseId, classNumber } = req.params;
  const movieFile = await db('videos').where({ courseIdRefVideos: courseId, classNumber: classNumber }).first();

  if (!movieFile || !movieFile.videoPath) { return res.status(404).end('<h1>Video não encontrado</h1>'); }
  fs.stat(movieFile.videoPath, (error, stats) => {
    if (error) {
      console.log(error)
      return res.status(404).end('video not found');
    }

    const { range } = req.headers;
    const { size } = stats;
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

    const stream = fs.createReadStream(movieFile.videoPath, { start, end });
    stream.on('open', () => stream.pipe(res));
    stream.on('error', (streamErr) => res.end(streamErr));
    return null;
  });
}

exports.checkProgress = (req, res) => {
  const { courseId, userId } = req.params;
  db('progress').where({ courseId, userId }).first().then((data) => {
    if (!data) {
      return res.status(200).send({ lastSeen: 0 });
    }
    return res.status(200).send({ lastSeen: data.lastSeen || 0 });
  })
}

exports.updateProgress = async (req, res) => {
  const { courseId, userId } = req.params;
  const { body } = req;
  const data = await db('progress').where({ courseId, userId }).first();

  if (!data) {
    console.log('criado')
    await db('progress').insert({ courseId, userId, lastSeen: body.lastSeen, progressId: `${userId}-${courseId}` })
  } else {
    await db('progress').where({ courseId, userId }).first().update({ lastSeen: body.lastSeen })
  }
  return res.status(200).send('progress updated')
}