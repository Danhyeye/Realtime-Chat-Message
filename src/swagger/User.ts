/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email
 *         phone:
 *           type: string
 *           description: User's phone number
 *         password:
 *           type: string
 *           description: User's password
 *         bio:
 *           type: string
 *           description: User's bio
 *         profilePic:
 *           type: string
 *           description: User's profile picture URL
 *       example:
 *         id: d5fE_asz
 *         name: John Doe
 *         email: johndoe@example.com
 *         phone: 1234567890
 *         password: secret123
 *         bio: Available
 *         profilePic: https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/search:
 *   post:
 *     summary: Search users by name or email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePic:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/friend-request:
 *   post:
 *     summary: Send a friend request
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               friendId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend request sent
 *       404:
 *         description: User not found
 *       400:
 *         description: Friend request already sent or user is already a friend
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/accept-friend:
 *   post:
 *     summary: Accept a friend request
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               friendId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend request accepted
 *       404:
 *         description: User not found
 *       400:
 *         description: No friend request found
 *       403:
 *         description: You can only accept requests sent to you
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/reject-friend:
 *   post:
 *     summary: Reject a friend request
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               friendId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend request rejected
 *       404:
 *         description: User not found
 *       400:
 *         description: No friend request found
 *       403:
 *         description: You can only reject requests sent to you
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/remove-friend:
 *   post:
 *     summary: Remove a friend
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               friendId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend removed
 *       404:
 *         description: User not found
 *       400:
 *         description: User is not a friend
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/block:
 *   post:
 *     summary: Block a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               blockId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User blocked
 *       404:
 *         description: User not found
 *       400:
 *         description: User is already blocked
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/unblock:
 *   post:
 *     summary: Unblock a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               unblockId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User unblocked and unfriended
 *       404:
 *         description: User not found
 *       400:
 *         description: User is not blocked
 *       500:
 *         description: Internal server error
 */
