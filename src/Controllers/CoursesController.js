const db = require('./../../db.js');

// Create User
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

// Update User
exports.put = async (req, res) => {
  let id = req.params.id;
  await db("courses").update(req.body).where({ idCourse: id });
  const updateUser = await db("courses").where({ idCourse: id });
  return res.status(200).json(...updateUser);
}

// Delete User
exports.delete = (req, res) => {
  let id = req.params.id;
  db('courses').del().where({ idCourse : id}).then(() => {
  res.status(200).json({ message: "Deleted" });
  })
}

// Get User List
exports.get = (req, res) => {
  db.select().table('courses').then(data => {
    res.status(200).send(JSON.stringify(data));
  });
}

// Get User by Id
exports.getById = (req, res) => {
  let id = req.params.id;
  db.select().table('courses').where({'id_courses': id})
  .then((data) => {
    if(data.length === 0) {
      return res.status(404).json({
        error: 'User does not exist'
      });
    }else {
      res.status(200).send(data);
    }
  })
}

