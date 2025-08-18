// export const sendMassage = async (req, res) => {
//   try {
//     const { senderId, receiverId, content, messageStatus } = req.body;
//     const file = req.file;

//     const participants = [senderId, receiverId].sort();
//     //check conversation alredy exist
//     let conversation = await Conversation.findOne({
//       participants: participants,
//     });
//     if (!conversation) {
//       conversation = new Conversation({
//         participants,
//       });
//       await conversation.save();
//     }
//     let imageOrVideoUrl = null;
//     let contentType = null;

//     //handle file upload
//     if (file) {
//       const uploadFile = await uploadFileToCloudinary(file);
//       if (uploadFile?.secure_url) {
//         return response(res, 400, "Failed to uploas media");
//       }
//       imageOrVideoUrl = uploadFile?.secure_url;

//       if (file.mimetype.startWith("image")) {
//         contentType = "image";
//       } else if (file.mimetype.startWith("video")) {
//         contentType = "video";
//       } else {
//         return response(res, 400, "Unsupported Type");
//       }
//     } else if (content?.trim()) {
//       contentType = "text";
//     } else {
//       return response(res, 400, "Message Content is Required");
//     }

//     const message = new Message({
//       conversation: conversation?._id,
//       sender: senderId,
//       receiver: receiverId,
//       content,
//       contentType,
//       imageOrVideoUrl,
//       messageStatus,
//     });
//     await message.save();

//     if (message?.content) {
//       conversation.lastMessage = message?.id;
//     }
//     conversation.unreadCount += 1;
//     await conversation.save();

//     const populatedMessage = await Message.findOne(message?._id)
//       .populate("sender", "username profilePicture")
//       .populate("receiver", "username profilePicture");

//     return response(res, 200, "Mesage Send Successfully", populatedMessage);
//   } catch (error) {
//     console.error(error);
//     return response(res, 500, "Internal Server Error");
//   }
// };
