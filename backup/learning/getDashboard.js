const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'super-secret' // Change on production
const dummyUsers = [
  {
    id: 1,
    fname: 'John',
    lname: 'Doe',
    uname: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    rule: 'admin',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1374&auto=format&fit=crop',
    gender: 'male',
  },
  {
    id: 2,
    fname: 'Jane',
    lname: 'Smith',
    uname: 'janesmith',
    email: 'jane@example.com',
    password: 'password123',
    rule: 'user',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop',
    gender: 'female',
  },
  {
    id: 3,
    fname: 'Michael',
    lname: 'Brown',
    uname: 'mbrown',
    email: 'michael@example.com',
    password: 'password123',
    rule: 'editor',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1470&auto=format&fit=crop',
    gender: 'male',
  },
  {
    id: 4,
    fname: 'Emily',
    lname: 'Davis',
    uname: 'emilyd',
    email: 'emily@example.com',
    password: 'password123',
    rule: 'user',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop',
    gender: 'female',
  },
  {
    id: 5,
    fname: 'Chris',
    lname: 'Wilson',
    uname: 'cwilson',
    email: 'chris@example.com',
    password: 'password123',
    rule: 'admin',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop',
    gender: 'male',
  },
  {
    id: 6,
    fname: 'Sarah',
    lname: 'Miller',
    uname: 'sarahm',
    email: 'sarah@example.com',
    password: 'password123',
    rule: 'user',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1376&auto=format&fit=crop',
    gender: 'female',
  },
  {
    id: 7,
    fname: 'David',
    lname: 'Garcia',
    uname: 'dgarcia',
    email: 'david@example.com',
    password: 'password123',
    rule: 'editor',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1374&auto=format&fit=crop',
    gender: 'male',
  },
  {
    id: 8,
    fname: 'Sophia',
    lname: 'Martinez',
    uname: 'sophiam',
    email: 'sophia@example.com',
    password: 'password123',
    rule: 'user',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1374&auto=format&fit=crop',
    gender: 'female',
  },
  {
    id: 9,
    fname: 'James',
    lname: 'Anderson',
    uname: 'janderson',
    email: 'james@example.com',
    password: 'password123',
    rule: 'user',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1374&auto=format&fit=crop',
    gender: 'male',
  },
  {
    id: 10,
    fname: 'Isabella',
    lname: 'Taylor',
    uname: 'itaylor',
    email: 'isabella@example.com',
    password: 'password123',
    rule: 'admin',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1374&auto=format&fit=crop',
    gender: 'female',
  },
  {
    id: 11,
    fname: 'Robert',
    lname: 'Thomas',
    uname: 'rthomas',
    email: 'robert@example.com',
    password: 'password123',
    rule: 'user',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1480&auto=format&fit=crop',
    gender: 'male',
  },
  {
    id: 12,
    fname: 'Mia',
    lname: 'Moore',
    uname: 'miamoore',
    email: 'mia@example.com',
    password: 'password123',
    rule: 'editor',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1374&auto=format&fit=crop',
    gender: 'female',
  },
  {
    id: 13,
    fname: 'William',
    lname: 'Jackson',
    uname: 'wjackson',
    email: 'will@example.com',
    password: 'password123',
    rule: 'user',
    image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=1374&auto=format&fit=crop',
    gender: 'male',
  },
  {
    id: 14,
    fname: 'Olivia',
    lname: 'White',
    uname: 'owhite',
    email: 'olivia@example.com',
    password: 'password123',
    rule: 'admin',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2a04?q=80&w=1374&auto=format&fit=crop',
    gender: 'female',
  },
  {
    id: 15,
    fname: 'Ethan',
    lname: 'Harris',
    uname: 'eharris',
    email: 'ethan@example.com',
    password: 'password123',
    rule: 'user',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1448&auto=format&fit=crop',
    gender: 'male',
  },
]

// login
async function login(req, res) {
  try {
    const token = jwt.sign(dummyUsers[1], SECRET_KEY, { expiresIn: '1h' })
    // We always return success with a dummy token
    res.json({
      status: 'success',
      message: 'Success : Logged in Successfully',
      token: token,
    })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null })
  }
}

// register
async function register(req, res) {
  try {
    res.json({
      status: 'success',
      message: 'Success : Registered Successfully',
    })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null })
  }
}

// users
async function getUsers(req, res) {
  try {
    res.json({
      users: dummyUsers,
    })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null })
  }
}

async function getUserById(req, res) {
  try {
    const token = jwt.sign(dummyUsers[1], SECRET_KEY, { expiresIn: '1h' })
    res.json({
      status: dummyUsers[0],
      message: 'User Profile Data Return',
      token: token,
    })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null })
  }
}

async function updateUser(req, res) {
  try {
    const token = jwt.sign(dummyUsers[1], SECRET_KEY, { expiresIn: '1h' })
    res.json({
      status: 'updated',
      message: 'Updated : User Profile Updated Successfully',
      token: token,

    })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null })
  }
}

async function deleteUser(req, res) {
  try {
    res.json({
      status: 'deleted',
      message: 'Deleted : User Deleted Successfully',
    })
  } catch (err) {
    res.status(418).json({ message: 'Invalid Data', data: null })
  }
}

router.route('/login').post(login)
router.route('/register').post(register)
router.route('/users').get(getUsers)
router.route('/:id').get(getUserById).post(updateUser).delete(deleteUser)
module.exports = router
