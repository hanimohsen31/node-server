export function SendResponse(req, res, responseObject) {
  // console.log('params', req.params)
  // console.log('payload', req.body)

  try {
    res.status(200).json(responseObject)
  } catch (err) {
    res.status(400).json({ message: 'Invalid Data', data: null })
  }
}
