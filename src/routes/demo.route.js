const router = require("express").Router();
const DemoCtrl = require("./../controllers/demo.controller");

/**
 * @apiVersion 0.1.0
 * @api {post} /demos/ 1. Create a new demo
 * @apiPermission user
 * @apiName Create
 * @apiGroup Demo
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "id": "5d9f1140f10a81216cfd4408",
 *      // ...
 *  }
 */
router.post("/", DemoCtrl.create);

/**
 * @apiVersion 0.1.0
 * @api {get} /demos/ 2. Get all demo
 * @apiPermission admin
 * @apiName GetAll
 * @apiGroup Demo
 *
 * @apiSuccessExample {json} Success-Response:
 *  [
 *      {
 *          "id": "5d9f1140f10a81216cfd4408",
 *          // ...
 *      }
 *  ]
 */
router.get("/", DemoCtrl.getAll);

/**
 * @apiVersion 0.1.0
 * @api {get} /demos/:demoId 3. Get one demo
 * @apiPermission user
 * @apiName GetOne
 * @apiGroup Demo
 *
 * @apiParam {string} demoId The demo ID.
 * 
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "id": "5d9f1140f10a81216cfd4408",
 *      // ...
 *  }
 */
router.get("/:demoId", DemoCtrl.getOne);

/**
 * @apiVersion 0.1.0
 * @api {put} /demos/:demoId 4. Update one demo
 * @apiPermission user
 * @apiName Update
 * @apiGroup Demo
 *
 * @apiParam {string} demoId The demo ID.
 * 
 * @apiBody {string} [field] The field to be updated.
 * 
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "id": "5d9f1140f10a81216cfd4408",
 *      "field": "field", // updated field
 *      // ...
 * 
 *  }
 */
router.put("/:demoId", DemoCtrl.update);

module.exports = router;
