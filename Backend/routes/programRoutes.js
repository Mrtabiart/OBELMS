const express = require("express");
const { 
  getAllPrograms,
  getProgramsByDepartment,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram
} = require("../controllers/programController");

const router = express.Router();


router.get("/", getAllPrograms);
router.get("/department/:departmentId", getProgramsByDepartment);
router.get("/:id", getProgramById);
router.post("/", createProgram);
router.put("/:id", updateProgram);
router.delete("/:id", deleteProgram);

module.exports = router;