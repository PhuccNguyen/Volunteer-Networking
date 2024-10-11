import User from "../models/User.js";

/* SEND FRIEND REQUEST */
export const sendFriendRequest = async (req, res) => {
    try {
        const { userId, targetUserId } = req.body;

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if a request has already been sent
        if (targetUser.friendRequestsReceived.includes(userId)) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        // Add the user to sent requests and the target to received requests
        user.friendRequestsSent.push(targetUserId);
        targetUser.friendRequestsReceived.push(userId);

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "Friend request sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error sending friend request" });
    }
};

/* ACCEPT FRIEND REQUEST */
export const acceptFriendRequest = async (req, res) => {
    try {
        const { userId, requesterId } = req.body;

        const user = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (!requester) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.friendRequestsReceived.includes(requesterId)) {
            return res.status(400).json({ message: "No friend request found" });
        }

        // Update the friend lists
        user.friends.push(requesterId);
        requester.friends.push(userId);

        // Remove friend request from both users
        user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== requesterId);
        requester.friendRequestsSent = requester.friendRequestsSent.filter(id => id.toString() !== userId);

        await user.save();
        await requester.save();

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        res.status(500).json({ message: "Error accepting friend request" });
    }
};

/* REJECT FRIEND REQUEST */
export const rejectFriendRequest = async (req, res) => {
    try {
        const { userId, requesterId } = req.body;

        const user = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (!requester) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.friendRequestsReceived.includes(requesterId)) {
            return res.status(400).json({ message: "No friend request found" });
        }

        // Remove the request
        user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== requesterId);
        requester.friendRequestsSent = requester.friendRequestsSent.filter(id => id.toString() !== userId);

        await user.save();
        await requester.save();

        res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting friend request" });
    }
};

/* CANCEL FRIEND REQUEST */
export const cancelFriendRequest = async (req, res) => {
    try {
        const { userId, targetUserId } = req.body;

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.friendRequestsSent.includes(targetUserId)) {
            return res.status(400).json({ message: "No friend request to cancel" });
        }

        // Remove request
        user.friendRequestsSent = user.friendRequestsSent.filter(id => id.toString() !== targetUserId);
        targetUser.friendRequestsReceived = targetUser.friendRequestsReceived.filter(id => id.toString() !== userId);

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "Friend request cancelled" });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling friend request" });
    }
};

/* GET FRIEND LIST */
export const getUserFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        const friends = await Promise.all(
            user.friends.map(friendId => User.findById(friendId))
        );

        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, userName, picturePath }) => {
                return { _id, firstName, lastName, userName, picturePath };
            }
        );

        res.status(200).json(formattedFriends);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }   
};

/* ADD OR REMOVE FRIEND */
export const addRemoveFriends = async (req, res) => {
    try {
        const { id, friendId } = req.params;
        const user = await User.findById(id);
        const friend = await User.findById(friendId);

        if (user.friends.includes(friendId)) {
            user.friends = user.friends.filter(friend => friend !== friendId);
            friend.friends = friend.friends.filter(f => f !== id);
        } else {
            user.friends.push(friendId);
            friend.friends.push(id);
        }

        await user.save();
        await friend.save();

        const friends = await Promise.all(
            user.friends.map(friendId => User.findById(friendId))
        );

        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, userName, picturePath }) => {
                return { _id, firstName, lastName, userName, picturePath };
            }
        );

        res.status(200).json(formattedFriends);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/* GET FRIEND REQUEST STATUS */
export const getFriendRequestStatus = async (req, res) => {
    try {
        const { userId, targetUserId } = req.params;

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check the status between the two users
        if (user.friends.includes(targetUserId)) {
            return res.status(200).json({ status: "friends" });
        } else if (user.friendRequestsSent.includes(targetUserId)) {
            return res.status(200).json({ status: "request_sent" });
        } else if (user.friendRequestsReceived.includes(targetUserId)) {
            return res.status(200).json({ status: "request_received" });
        } else {
            return res.status(200).json({ status: "not_friends" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching friend request status" });
    }
};

// DELETE FRIEND
export const deleteFriend = async (req, res) => {
    try {
        const { userId, friendId } = req.body; // Lấy userId và friendId từ body của request

        // Tìm cả hai người dùng
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found" });
        }

        // Kiểm tra xem cả hai người dùng có nằm trong danh sách bạn bè của nhau không
        if (!user.friends.includes(friendId) || !friend.friends.includes(userId)) {
            return res.status(400).json({ message: "Not friends" });
        }

        // Xóa bạn khỏi danh sách của cả hai người dùng
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        // Lưu lại thông tin của cả hai người dùng
        await user.save();
        await friend.save();

        res.status(200).json({ message: "Friend deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting friend" });
    }
};


/* GET FRIEND REQUESTS RECEIVED */
export const getFriendRequestsReceived = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate('friendRequestsReceived', 'firstName lastName userName picturePath');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.friendRequestsReceived);
    } catch (error) {
        res.status(500).json({ message: "Error fetching friend requests" });
    }
};

/* GET FRIEND REQUESTS SENT */
export const getFriendRequestsSent = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate('friendRequestsSent', 'firstName lastName userName picturePath');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.friendRequestsSent);
    } catch (error) {
        res.status(500).json({ message: "Error fetching friend requests" });
    }
};

// controllers/friends.js

export const getFriendSuggestions = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        // Find friends of the current user
        const userFriends = user.friends;

        // Find users who are not already friends with the current user
        // Exclude the current user from the suggestions
        const allUsers = await User.find({
            _id: { $ne: userId },
            friends: { $nin: [userId] },
        });

        // Filter out the users that have common friends or similar attributes
        const suggestions = allUsers.filter((potentialFriend) => {
            // Check if they have common friends
            const commonFriends = potentialFriend.friends.filter((friendId) =>
                userFriends.includes(friendId)
            ).length;

            // Check if they have the same occupation
            const sameOccupation = potentialFriend.occupation === user.occupation;

            // Suggest if they have at least one common friend or the same occupation
            return commonFriends > 0 || sameOccupation;
        });

        // Format the suggestions to send back only necessary details
        const formattedSuggestions = suggestions.map(({ _id, firstName, lastName, picturePath, occupation }) => ({
            _id,
            firstName,
            lastName,
            picturePath,
            occupation,
        }));

        res.status(200).json(formattedSuggestions);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};


// Controller function
export const getUserFriendRequests = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate('friendRequestsReceived', '_id firstName lastName email picturePath');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user.friendRequestsReceived);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friend requests' });
    }
};

// Get the list of sent friend requests
export const getSentFriendRequests = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        const sentRequests = await Promise.all(
            user.friendRequestsSent.map((friendId) => User.findById(friendId))
        );

        const formattedRequests = sentRequests.map(({ _id, firstName, lastName, picturePath }) => ({
            _id,
            firstName,
            lastName,
            picturePath,
        }));

        res.status(200).json(formattedRequests);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};
