const express = require('express')
const router = express.Router()
const fs = require('fs')
const { type } = require('os')
const path = require('path')

// get all

async function GetUsers(req, res) {
  let sorting = req.body.sort[0]
  let filtering = req.body.filter[0]
  let pagination = req.body.pagination
  //  datasource
  const filePath = path.join(__dirname, '../dev-data/dummy-users.json')
  let users = JSON.parse(fs.readFileSync(filePath))
  // console.log(req.body)

  try {
    // Sorting
    if (sorting) {
      const sortBy = sorting.selector
      const isDesc = sorting.desc === true

      // number
      if (typeof users[0][sortBy] === 'number') {
        // console.log('number')
        if (!isDesc) users.sort((a, b) => a[sortBy] - b[sortBy])
        else users.sort((a, b) => b[sortBy] - a[sortBy])
      }
      // boolean
      else if (typeof users[0][sortBy] === 'boolean') {
        // console.log('boolean')
        if (!isDesc) users.sort((a, b) => a[sortBy] - b[sortBy])
        else users.sort((a, b) => b[sortBy] - a[sortBy])
      }
      // date
      else if (typeof users[0][sortBy] === 'date' || sortBy === 'createdAt') {
        // console.log('date')
        if (!isDesc) users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        else users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }
      //string
      else if (typeof users[0][sortBy] === 'string') {
        // console.log('string')
        if (!isDesc) users.sort((a, b) => a.name.localeCompare(b.name))
        else users.sort((a, b) => b.name.localeCompare(a.name))
      }
      //else
      else {
        // console.log('else')
        if (!isDesc) users.sort((a, b) => a[sortBy] - b[sortBy])
        else users.sort((a, b) => b[sortBy] - a[sortBy])
      }
    }

    // Filtering
    if (filtering && filtering.name && (filtering.value !== undefined && filtering.value !== "" && filtering.value !== null)) {
      const filterColumn = filtering.name
      const filterValue = filtering.value
      const operator = filtering.operator
      // console.log("TYPE: ",typeof filterValue);
      users = users.filter((user) => {
        if (typeof filterValue == 'string' && isNaN(new Date(filterValue))) {
          const value = user[filterColumn].toLowerCase()
          if (operator == 'contains') return value.includes(filterValue.toLowerCase())
          else if (operator == 'startswith') return value.startsWith(filterValue.toLowerCase())
          else if (operator == 'endswith') return value.endsWith(filterValue.toLowerCase())
          else if (operator == 'equal') return value == filterValue.toLowerCase()
          else if (operator == 'notcontains') return !value.includes(filterValue.toLowerCase())
          else return value.includes(filterValue.toLowerCase())
        } else if (typeof filterValue == 'number') {
          const value = user[filterColumn]
          if (operator == 'equal' || operator == '=') return value == filterValue
          else if (operator == 'notequal' || operator == '&lt;>') return value != filterValue
          else if (operator == 'gt') return value > filterValue
          else if (operator == 'gte') return value >= filterValue
          else if (operator == 'lt') return value < filterValue
          else if (operator == 'lte') return value <= filterValue
        } else if (typeof filterValue == 'boolean') {
          const value = user[filterColumn]
          return value == filterValue
        } else if (!isNaN(new Date(filterValue))) {
          const value = user[filterColumn]
          if (operator == 'dateIs') return new Date(value).toISOString().split('T')[0] == new Date(filterValue).toISOString().split('T')[0]
          if (operator == 'dateIsNot') return new Date(value).toISOString().split('T')[0] !== new Date(filterValue).toISOString().split('T')[0]
          else if (operator == 'dateBefore') return new Date(value).toISOString().split('T')[0] < new Date(filterValue).toISOString().split('T')[0]
          else if (operator == 'dateAfter') return new Date(value).toISOString().split('T')[0] > new Date(filterValue).toISOString().split('T')[0]
        } else {
          // console.log('else')
          return
        }
      })
    }

    // Pagination
    const pageNumber = pagination?.pageNumber || 1
    const pageSize = pagination?.pageSize || 10
    const skippedRecords = (pageNumber - 1) * pageSize

    const pagedUsers = users.slice(skippedRecords, skippedRecords + pageSize)

    res.status(200).json({
      message: 'Records',
      data: pagedUsers,
      pagination: { pageNumber, pageSize, total: users.length },
    })
  } catch (err) {
    // console.log('ERROR', err)
    res.status(500).json({ message: 'Error reading data', data: null, error: err.message })
  }
}

router.route('').post(GetUsers)
module.exports = router
