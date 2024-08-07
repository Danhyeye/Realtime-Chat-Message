/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       required:
 *         - chatName
 *         - isGroup
 *         - users
 *         - groupAdmin
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the chat
 *         chatName:
 *           type: string
 *           description: Name of the chat
 *         isGroup:
 *           type: boolean
 *           description: Whether the chat is a group chat
 *         users:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs in the chat
 *         latestMessage:
 *           type: string
 *           description: The ID of the latest message in the chat
 *         groupAdmin:
 *           type: string
 *           description: The user ID of the group admin
 *       example:
 *         id: d5fE_asz
 *         chatName: "Group Chat"
 *         isGroup: true
 *         users: ["user1", "user2"]
 *         latestMessage: "message1"
 *         groupAdmin: "adminUser"
 */

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat management
 */

/**
 * @swagger
 * /api/chats/access:
 *   post:
 *     summary: Access chats by user ID
 *     tags: [Chats]
 *     parameters:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalChats:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all chats
 *     tags: [Chats]
 *     parameters:
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
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalChats:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats/create:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chat'
 *     responses:
 *       201:
 *         description: Chat created successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats/rename:
 *   put:
 *     summary: Rename a group chat
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               newChatName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group chat renamed successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats/add:
 *   put:
 *     summary: Add a user to a group chat
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User added to group chat
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats/remove:
 *   put:
 *     summary: Remove a user from a group chat
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User removed from group chat
 *       500:
 *         description: Internal server error
 */
