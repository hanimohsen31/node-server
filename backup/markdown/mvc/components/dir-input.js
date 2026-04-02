const DirInputComponent = () => `
  <div class="container d-flex flex-column gap-3 pt-3">
    <div class="w-100">
      <label for="setPathBtnInput">Password</label>
      <input 
        type="text" 
        class="form-control" 
        id="setPathBtnInput"
        placeholder="Directory Path" 
        value="${process.env.MARKDOWN_DIR_PATH}"
      >
    </div>
    <div class="d-flex justify-content-end">
      <button type="submit" class="btn btn-primary mb-3" id="setPathBtn">SUBMIT</button>
    </div>
  </div>
`
module.exports = { DirInputComponent }