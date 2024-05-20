const Chat = require("../models/chats");
const response = require("../utils/responseHelpers");
const  ChatModel  = require("../models/chats"); 
const { default: mongoose, Mongoose, Schema } = require("mongoose");
const { deleteFields } = require("../utils/utility");
const { findUsers } = require("../models/users");

// get all chats from chat id and user id


// const getChats = async (req, res) => {
//   try {
//     let page = 1;
//     userId= req.query.userId;

//     pageSize = 20;
//     chatSupport = false;
//     chatId = req.body.chatId;
//     const skip = (page - 1) * pageSize;
//     console.log(skip, page, pageSize, chatSupport, chatId);
//     const currentUserId = new mongoose.Types.ObjectId(userId);
//     const chatSupportPip = {
//       isChatSupport: chatSupport == "true" || chatSupport == true,
//     };
//     if (chatId) chatSupportPip._id = new mongoose.Types.ObjectId(chatId);
//     const result = await ChatModel.aggregate([
//       {
//         $match: {
//           ...chatSupportPip,
//           $or: [
//             {
//               $and: [
//                 { "participants.userId": currentUserId },
//                 { "participants.status": "active" },
//                 { chatType: "one-to-one" },
//               ],
//             },
//             {
//               $and: [
//                 {
//                   $or: [
//                     { "participants.userId": currentUserId },
//                     { "messages.receivedBy.userId": currentUserId },
//                     { "messages.sentBy": currentUserId },
//                   ],
//                 },
//                 { chatType: "group" },
//               ],
//             },
//           ],
//         },
//       },
//       { $sort: { lastUpdatedAt: -1 } },
//       { $skip: skip },
//       { $limit: parseInt(pageSize) },
//       {
//         $lookup: {
//           from: "users",
//           let: { participantIds: "$participants.userId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: ["$_id", "$$participantIds"],
//                 },
//               },
//             },
//             {
//               $project: {
//                 firstName: 1,
//                 lastName: 1,
//                 email: 1,
//                 photo: 1,
//                 image: 1,
//               },
//             },
//           ],
//           as: "participantsData",
//         },
//       },
//       {
//         $unwind: { path: "$messages", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $group: {
//           _id: "$_id", // Unique identifier for the chat
//           chatType: { $first: "$chatType" },
//           isTicketClosed: { $first: "$isTicketClosed" },
//           isChatSupport: { $first: "$isChatSupport" },
//           groupName: { $first: "$groupName" },
//           participantUsernames: { $first: "$participantUsernames" },
//           totalMessages: { $first: "$totalMessages" },
//           messages: { $push: "$messages" }, // Push the messages into an array again
//           lastMessage: { $last: "$messages" }, // Get the last message as before
//           participants: { $first: "$participantsData" },
//           totalCount: { $first: "$totalCount" },
//           unReadCount: { $first: "$unReadCount" },
//         },
//       },
//       {
//         $addFields: {
//           messages: {
//             // $slice: [
//             //   {
//             $filter: {
//               input: "$messages",
//               cond: {
//                 $or: [
//                   {
//                     $and: [
//                       { $eq: ["$$this.sentBy", currentUserId] },
//                       { $ne: ["$$this.deleted", true] },
//                     ],
//                   },
//                   {
//                     $and: [
//                       { $ne: ["$$this.sentBy", currentUserId] },
//                       {
//                         $in: [currentUserId, "$$this.receivedBy.userId"],
//                       },
//                       {
//                         $not: {
//                           $in: [true, "$$this.receivedBy.deleted"],
//                         },
//                       },
//                     ],
//                   },
//                 ],
//               },
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           participants: {
//             $map: {
//               input: "$participants",
//               as: "participant",
//               in: {
//                 $mergeObjects: [
//                   "$$participant",
//                   {
//                     $arrayElemAt: [
//                       {
//                         $filter: {
//                           input: "$participantsData",
//                           cond: {
//                             $eq: ["$$this._id", "$$participant.userId"],
//                           },
//                         },
//                       },
//                       0,
//                     ],
//                   },
//                 ],
//               },
//             },
//           },
//           lastMessage: { $last: "$messages" },
//           totalCount: { $size: "$messages" },
//           unReadCount: {
//             $size: {
//               $filter: {
//                 input: "$messages",
//                 cond: {
//                   $and: [
//                     { $ne: ["$$this.sentBy", currentUserId] },
//                     { $in: [currentUserId, "$$this.receivedBy.userId"] },
//                     {
//                       $not: {
//                         $in: ["seen", "$$this.receivedBy.status"],
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           },
//           messages: { $reverseArray: { $slice: ["$messages", -40] } },
//         },
//       },
//       {
//         $match: {
//           $or: [
//             { chatType: "group" },
//             { $and: [{ chatType: "one-to-one", messages: { $ne: [] } }] },
//           ],
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "lastMessage.sentBy",
//           foreignField: "_id",
//           as: "sender",
//         },
//       },
//       { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } }, // Unwind the sender array
//       {
//         $addFields: {
//           "lastMessage.firstName": {
//             $cond: [
//               { $ne: ["$sender", null] },
//               { $concat: ["$sender.firstName"] },
//               "Unknown User",
//             ],
//           },
//           "lastMessage.lastName": {
//             $cond: [
//               { $ne: ["$sender", null] },
//               { $concat: ["$sender.lastName"] },
//               "Unknown User",
//             ],
//           },
//           "lastMessage.photo": {
//             $cond: [
//               { $ne: ["$sender", null] },
//               { $concat: ["$sender.photo"] },
//               "Unknown User",
//             ],
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id", // Unique identifier for the chat
//           chatType: { $first: "$chatType" },
//           isTicketClosed: { $first: "$isTicketClosed" },
//           isChatSupport: { $first: "$isChatSupport" },
//           groupName: { $first: "$groupName" },
//           participantUsernames: { $first: "$participantUsernames" },
//           totalMessages: { $first: "$totalMessages" },
//           messages: { $first: "$messages" },
//           lastMessage: { $first: "$lastMessage" },
//           participants: { $first: "$participants" },
//           totalCount: { $first: "$totalCount" },
//           unReadCount: { $first: "$unReadCount" },
//         },
//       },
//       {
//         $sort: {
//           "lastMessage.createdAt": -1,
//         },
//       },
//       {
//         $project: {
//           chatType: 1,
//           groupName: 1,
//           isTicketClosed: 1,
//           isChatSupport: 1,
//           // messages: 1,
//           lastMessage: 1,
//           participants: 1,
//           totalCount: 1,
//           unReadCount: 1,
//         },
//       },
//     ]);
//   //  if (this.io) this.io.emit(`getChats/${userId}`, result);
//     return response.success(res, "success", {result})
//   } catch (error) {
//     // Handle error
//     console.error("Error retrieving user chats:", error);
//     return response.serverError(res)
//   }
// };

const getMessages = async(req,res) => {
  try{
    chatId = req.query.chatId, 
    userId= req.query.userId,
    adId  = req.query.adId,
    pageNumber= 1;
    pageSize = 20;
    const skip = (pageNumber - 1) * parseInt(pageSize);

    const result = await ChatModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(chatId) } }, // Match the chat ID
      { $unwind: "$messages" }, // Unwind the messages array
      { $sort: { "messages.createdAt": -1 } }, // Sort messages by latest createdAt date
      { $skip: skip }, // Skip the specified number of messages
      { $limit: parseInt(pageSize) }, // Limit the number of messages per page
      {
        $match: {
          $or: [
            {
              "messages.sentBy": { $ne: null },
              "messages.sentBy": new mongoose.Types.ObjectId(userId),
              "messages.deleted": { $ne: true },
            },
            {
              // "messages.receivedBy.userId": { $ne: null },
              "messages.receivedBy": {
                $elemMatch: {
                  userId: { $ne: null },
                  userId: new mongoose.Types.ObjectId(userId),
                  deleted: { $ne: true },
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "messages.sentBy",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } }, // Unwind the sender array
      {
        $addFields: {
          "messages.senderId": "$sender._id",
          "messages.firstName": "$sender.firstName",
          "messages.lastName": "$sender.lastName",
          "messages.image": "$sender.image",
        },
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
          totalCount: { $sum: 1 }, // Calculate the total count of messages in the chat
          unReadCount: { $sum: "$unReadCount" }, // Calculate the total count of unread messages in the chat
        },
      },
    ]);

    // Step 3: Extract the messages, total count, and unread count from the result
    const messages = result.length > 0 ? result[0].messages : [];
    const totalCount = result.length > 0 ? result[0].totalCount : 0;
    const unReadCount = result.length > 0 ? result[0].unReadCount : 0;

    console.log("Messages:", messages);
    console.log("Total Count:", totalCount);
    console.log("Unread Count:", unReadCount);
    if (this.io)
      this.io.emit(`getChatMessages/${userId}`, {
        messages,
        totalCount,
        unReadCount,
      });
    return response.success(res, "messages retrived", { messages, totalCount, unReadCount });
  }
  catch(error){
    console.error("Error retrieving chat messages:", error);
    return response.serverError(res)
  }
};

const createChat = async (req, res) => {
  try {
    const { userId, participantIds, chatType } = req.body;
    //const { groupName, groupImageUrl } = req.body; // Assuming these properties are also in the request body

    let match = {
      "participants.userId": { $all: participantIds },
      deleted: false,
    };
    let check = null;
    if (chatType === "one-to-one") {
      match.chatType = "one-to-one";
      check = await ChatModel.findOne(match);
    }
    if (check) {
      check = await ChatModel.aggregate(findUserpipeline({ _id: check._id }));
      if (this.io) {
        participantIds.forEach((e) => {
          this.io.emit(`createChat/${e}`, {
            message: "chat already exists",
            data: check[0],
          });
        });
      }
      
      return res.status(200).json(check[0]); // Send response to the client
    }

    const data = await ChatModel.create({
    //  groupName,
      chatType,
    //  groupImageUrl,
      participants: participantIds.map((e) => ({
        userId: e,
        status: "active",
      })),
      createdBy: chatType === "one-to-one" ? null : userId,
      admins: chatType === "one-to-one" ? [] : [userId],
    });

    const d = await ChatModel.aggregate(findUserpipeline({ _id: data._id }));
    if (this.io) {
      participantIds.forEach((e) => {
        this.io.emit(`createChat/${e}`, {
          message: "chat created",
          data: d[0],
        });
      });
    }

    if (chatType === "group") {
      // Uncomment the following lines once the sendNotificationMsg function is implemented
      // await sendNotificationMsg({
      //   userIds: participantIds.filter((item) => item !== userId),
      //   title: groupName,
      //   body: "You are added to a group",
      //   chatId: d[0]._id,
      // });
    }
    return res.status(200).json(d[0]); // Send response to the client
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ error: "Internal server error" }); // Send error response to the client
  }
};

const getChats = async (req, res) => {
  try {
    let page = 1;
    userId = req.query.userId;
    adId = req.query.adId
    pageSize = 20;
    chatSupport = false;
    chatId = req.body.chatId;
    const skip = (page - 1) * pageSize;
    console.log(skip, page, pageSize, chatSupport, chatId);
    const currentUserId = new mongoose.Types.ObjectId(userId);
    const chatSupportPip = {
      isChatSupport: chatSupport == "true" || chatSupport == true,
    };
    if (chatId) chatSupportPip._id = new mongoose.Types.ObjectId(chatId);
    const result = await ChatModel.aggregate([
      {
        $match: {
          ...chatSupportPip,
          $or: [
            {
              $and: [
                { "participants.userId": currentUserId },
                { "participants.status": "active" },
                { chatType: "one-to-one" },
              ],
            },
            {
              $and: [
                {
                  $or: [
                    { "participants.userId": currentUserId },
                    { "messages.receivedBy.userId": currentUserId },
                    { "messages.sentBy": currentUserId },
                  ],
                },
                { chatType: "group" },
              ],
            },
          ],
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } }, // Sort by lastMessage.createdAt in descending order
      { $skip: skip },
      { $limit: parseInt(pageSize) },
      {
        $lookup: {
          from: "users",
          let: { participantIds: "$participants.userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$participantIds"],
                },
              },
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                photo: 1,
                image: 1,
              },
            },
          ],
          as: "participantsData",
        },
      },
      {
        $unwind: { path: "$messages", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$_id", // Unique identifier for the chat
          chatType: { $first: "$chatType" },
          isTicketClosed: { $first: "$isTicketClosed" },
          isChatSupport: { $first: "$isChatSupport" },
          groupName: { $first: "$groupName" },
          participantUsernames: { $first: "$participantUsernames" },
          totalMessages: { $first: "$totalMessages" },
          messages: { $push: "$messages" }, // Push the messages into an array again
          lastMessage: { $last: "$messages" }, // Get the last message as before
          participants: { $first: "$participantsData" },
          totalCount: { $first: "$totalCount" },
          unReadCount: { $first: "$unReadCount" },
        },
      },
      {
        $addFields: {
          messages: {
            $filter: {
              input: "$messages",
              cond: {
                $or: [
                  {
                    $and: [
                      { $eq: ["$$this.sentBy", currentUserId] },
                      { $ne: ["$$this.deleted", true] },
                    ],
                  },
                  {
                    $and: [
                      { $ne: ["$$this.sentBy", currentUserId] },
                      {
                        $in: [currentUserId, "$$this.receivedBy.userId"],
                      },
                      {
                        $not: {
                          $in: [true, "$$this.receivedBy.deleted"],
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          participants: {
            $map: {
              input: "$participants",
              as: "participant",
              in: {
                $mergeObjects: [
                  "$$participant",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$participantsData",
                          cond: {
                            $eq: ["$$this._id", "$$participant.userId"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
          lastMessage: { $last: "$messages" },
          totalCount: { $size: "$messages" },
          unReadCount: {
            $size: {
              $filter: {
                input: "$messages",
                cond: {
                  $and: [
                    { $ne: ["$$this.sentBy", currentUserId] },
                    { $in: [currentUserId, "$$this.receivedBy.userId"] },
                    {
                      $not: {
                        $in: ["seen", "$$this.receivedBy.status"],
                      },
                    },
                  ],
                },
              },
            },
          },
          messages: { $reverseArray: { $slice: ["$messages", -40] } },
        },
      },
      {
        $match: {
          $or: [
            { chatType: "group" },
            { $and: [{ chatType: "one-to-one", messages: { $ne: [] } }] },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sentBy",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } }, // Unwind the sender array
      {
        $addFields: {
          "lastMessage.firstName": {
            $cond: [
              { $ne: ["$sender", null] },
              { $concat: ["$sender.firstName"] },
              "Unknown User",
            ],
          },
          "lastMessage.lastName": {
            $cond: [
              { $ne: ["$sender", null] },
              { $concat: ["$sender.lastName"] },
              "Unknown User",
            ],
          },
          "lastMessage.photo": {
            $cond: [
              { $ne: ["$sender", null] },
              { $concat: ["$sender.photo"] },
              "Unknown User",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id", // Unique identifier for the chat
          chatType: { $first: "$chatType" },
          isTicketClosed: { $first: "$isTicketClosed" },
          isChatSupport: { $first: "$isChatSupport" },
          groupName: { $first: "$groupName" },
          participantUsernames: { $first: "$participantUsernames" },
          totalMessages: { $first: "$totalMessages" },
          messages: { $first: "$messages" },
          lastMessage: { $first: "$lastMessage" },
          participants: { $first: "$participants" },
          totalCount: { $first: "$totalCount" },
          unReadCount: { $first: "$unReadCount" },
        },
      },
      {
        $sort: {
          "lastMessage.createdAt": -1,
        },
      },
      {
        $project: {
          chatType: 1,
          groupName: 1,
          isTicketClosed: 1,
          isChatSupport: 1,
          lastMessage: 1,
          participants: 1,
          totalCount: 1,
          unReadCount: 1,
        },
      },
    ]);
    //  if (this.io) this.io.emit(`getChats/${userId}`, result);
    return response.success(res, "success", { result });
  } catch (error) {
    // Handle error
    console.error("Error retrieving user chats:", error);
    return response.serverError(res);
  }
};


function findUserpipeline(match) {
  return [
    { $match: match },
    {
      $lookup: {
        from: "users",
        let: { participantIds: "$participants.userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$participantIds"],
              },
            },
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              photo: 1,
            },
          },
        ],
        as: "participantsData",
      },
    },
    {
      $addFields: {
        participants: {
          $map: {
            input: "$participants",
            as: "participant",
            in: {
              $mergeObjects: [
                "$$participant",
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$participantsData",
                        cond: { $eq: ["$$this._id", "$$participant.userId"] },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        chatType: { $first: "$chatType" },
        groupName: { $first: "$groupName" },
        groupImageUrl: { $first: "$groupImageUrl" },
        // groupName: 1,
        participants: { $first: "$participants" },
        // Add other fields you want to include
      },
    },
    {
      $project: {
        // id: '$_id',
        chatType: 1,
        groupName: 1,
        groupImageUrl: 1,
        // participantUsernames: 1,
        // totalMessages: 1,
        // messages: { $reverseArray: { $slice: ["$messages", -40] } },
        // lastMessage: { $last: "$messages" },
        participants: 1,
        // totalCount: 1,
        // unReadCount: 1,
      },
    },
  ];
}
module.exports = {
  getMessages,
  getChats,
  createChat,
};
