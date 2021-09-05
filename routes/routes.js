const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  postEmployee,
  getEmployeeByID,
  deleteEmployee,
  updateEmployee,
} = require('../controllers/employee');

router.route('/').get(getAllEmployees).post(postEmployee);
router
  .route('/:id')
  .get(getEmployeeByID)
  .patch(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
