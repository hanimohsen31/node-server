class APIsFeatures {
  constructor(query, reqQuery) {
    this.query = query // new Tour.find()
    this.reqQuery = reqQuery // req.query
    // console.log(this.reqQuery)
  }

  filter() {
    let excluded = ['pageNumber', 'pageCount', 'sort', 'fields']
    excluded.forEach((elm) => delete this.reqQuery[elm])
    this.query.find(this.reqQuery)
    return this
  }

  sort() {
    if (this.reqQuery.sort) {
      let sortBy = this.reqQuery.sort.split(',').join()
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  fields() {
    if (this.reqQuery.fields) {
      let fields = this.reqQuery.fields.split(',').join()
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('')
      this.query = this.query.select('-__v')
    }
    return this
  }

  paging() {
    let pageNumber = +this.reqQuery.pageNumber || 1
    let pageCount = +this.reqQuery.pageCount || 10
    let skippedRecords = (pageNumber - 1) * pageCount
    this.query = this.query.skip(skippedRecords).limit(pageCount)
    return this
  }
}

module.exports = APIsFeatures
