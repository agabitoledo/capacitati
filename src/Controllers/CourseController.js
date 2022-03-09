const db = require('../../config/db');
const fs = require('fs');
const { json } = require("express/lib/response");
const pdf = require('html-pdf');

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
  await db('videos').where({ courseIdRefVideos: courseId }).then((data) => {
    if (data.length === 0) {
      console.log('entrou no controller certo')
      return res.status(400).json({ error: 'course does not exist or is empty' });
    }
    const sortedData = data.sort((a, b) => (
      a.number >= b.number ? 1 : -1
    ));
    return res.status(200).send(sortedData);
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
  console.log('Funcionou o video upload');
  //await db('videos').where({ courseIdRefVideos: courseId, classNumber: classNumber }).first().update({ videoPath: req.file.path || req.file.key});
  res.send('uploaded successfully');
}

exports.getVideo = async (req, res) => {
  const { courseId, classNumber } = req.params;
  const movieFile = await db('videos').where({ courseIdRefVideos: courseId, classNumber: classNumber }).first();
  console.log('entrou no controller errado')
  if (!movieFile || !movieFile.videoPath) { return res.status(404).end('<h1>Video não encontrado</h1>'); }

  if(process.env.STORAGE_TYPE === 's3') {
    const s3 = new aws.S3();
    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS.KEY,
    });
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.BUCKET_NAME,
      Key: movieFile.videoPath,
      Expires: 3600 * 3,
    });
    console.log('url: ', url);
    return res.status(200).send(url);
  }

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


exports.checkUserStatus = (req, res) => {
  const { courseId, userId } = req.params
  const status = [
    {
      code: 0,
      status: 'Não registrado'
    },
    {
      code: 1,
      status: 'Cursando'
    },
    {
      code: 2,
      status: 'Concluído'
    }
  ];
  db('course_status').where({ courseIdRefCourseStatus: courseId, userIdRefCourseStatus: userId }).first().then((data) => {
    console.log('checando')
    if (!data) {
      console.log('entrou no if')
      return res.status(200).send(status[0])
    }
    return res.status(200).send(status[data.status])
  })
}

exports.addUserToCourse = async (req, res) => {
  const { courseId, userId } = req.params;
  const data = await db('course_status').where({ courseIdRefCourseStatus: courseId, userIdRefCourseStatus: userId }).first();
  // 1 = Cursando / 2 = Concluido
  if (!data) {
    console.log('status criado');
    await db('course_status').insert({ courseIdRefCourseStatus: courseId, userIdRefCourseStatus: userId, status: 1 });
  }
  else {
    await db('course_status').where({ courseIdRefCourseStatus: courseId, userIdRefCourseStatus: userId }).first().update({ status: 1 })
  }
  return res.status(200).send('user added to course');
}


exports.setCompleted = async (req, res) => {
  const { courseId, userId } = req.params;
  const { body } = req;
  // 1 = Cursando / 2 = Concluido
  const data = await db('course_status').where({ courseIdRefCourseStatus: courseId, userIdRefCourseStatus: userId }).first();
  console.log('concluido')
  if (!data) {
    return res.status(400).json({ error: 'user not in this course' });
  }
  await db('course_status').where({ courseIdRefCourseStatus: courseId, userIdRefCourseStatus: userId }).first().update({ completionDate: body.completionDate, status: 2 })
  return res.status(200).send('course completed');
}

exports.generatePDF = async(req, res) => {
  const { courseId, userId} = req.params;
  const course = await db.select().table('courses').where({courseId}).first();
  const user = await db.select().table('users').where({userId}).first();
  //TODO: Transformar em arquivo HTML e estilizar
  const html = `
  <div style='position: absolute; height: 50%; width: 100%; top: 25%; right:0' >
    <h4 style='font-size: 28px; text-align:center'>HITSS ON</h4>
    <h1 style='font-size: 28px; text-align:center'>Certificado</h1>
    <h2 style='font-size: 28px; text-align:center'>${user.firstName} ${user.firstName}</h2>
    <h3 style='font-size: 28px; text-align:center'>Concluiu o curso ${course.title}</h3>
  </div>
  `;

  const options = {
    type: 'pdf',
    format:'A4',
    orientation: 'landscape',
  }

  pdf.create(html, options).toBuffer((err, buffer) => {
    if(err) return res.status(500).json(err);

    return res.end(buffer)
  })
}