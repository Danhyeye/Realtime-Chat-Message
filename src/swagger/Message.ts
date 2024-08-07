/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - message
 *         - sender
 *         - chat
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the message
 *         message:
 *           type: string
 *           description: The content of the message
 *         sender:
 *           type: string
 *           description: The user ID of the sender
 *         chat:
 *           type: string
 *           description: The chat ID the message belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time the message was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The time the message was last updated
 *         reactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *       example:
 *         id: d5fE_asz
 *         message: "Hello, world!"
 *         sender: "user1"
 *         chat: "chat1"
 *         createdAt: "2021-09-20T19:53:27.629Z"
 *         updatedAt: "2021-09-20T19:53:27.629Z"
 *         reactions: [{ userId: "user2", type: "like" }]
 */

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management
 */

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/messages/{chatId}:
 *   get:
 *     summary: Get messages for a chat
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The chat ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalMessages:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/messages/delete:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *               chatId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/messages/update:
 *   put:
 *     summary: Update a message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *               newMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/messages/react:
 *   post:
 *     summary: React to a message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message reaction updated successfully
 *       500:
 *         description: Internal server error
 */
