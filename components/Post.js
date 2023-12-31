import React, { useEffect, useState } from "react";

import {
  DotsHorizontalIcon,
  BookmarkIcon,
  ChatIcon,
  EmojiHappyIcon,
  PaperAirplaneIcon,
  HeartIcon,
} from "@heroicons/react/outline";

import {
  HeartIcon as HeartIconFilled,
  BookmarkIcon as BookmarkIconFilled,
} from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import Moment from "react-moment";
import { useRecoilState } from "recoil";
import { deleteModalState } from "@/atom/modalAtom";

const Post = ({ id, username, userImg, img, caption }) => {
  const { data: session } = useSession();

  const [openDeleteModal, setOpenDeleteModal] =
    useRecoilState(deleteModalState);

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setlikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [bookmarks, setbookmarks] = useState([]);
  const [hasbookmarked, setHasbookmarked] = useState(false);

  useEffect(() => {
    const unSub = onSnapshot(
      query(
        collection(db, "posts", id, "comments"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => {
        setComments(snapshot.docs);
      }
    );

    return unSub;
  }, [db]);

  useEffect(() => {
    const unSub = onSnapshot(
      query(collection(db, "posts", id, "likes")),
      (snapshot) => {
        setlikes(snapshot.docs);
      }
    );

    return unSub;
  }, [db]);

  useEffect(() => {
    const unSub = onSnapshot(
      query(collection(db, "posts", id, "bookmark")),
      (snapshot) => {
        setbookmarks(snapshot.docs);
      }
    );

    return unSub;
  }, [db]);

  useEffect(() => {
    setHasLiked(
      likes.findIndex((like) => like.id === session?.user?.uid) !== -1
    );
  }, [likes]);

  useEffect(() => {
    setHasbookmarked(
      bookmarks.findIndex((bookmark) => bookmark.id === session?.user?.uid) !==
        -1
    );
  }, [bookmarks]);

  const likePost = async () => {
    if (hasLiked) {
      await deleteDoc(doc(db, "posts", id, "likes", session.user.uid));
    } else {
      await setDoc(doc(db, "posts", id, "likes", session.user.uid), {
        username: session.user.username,
      });
    }
  };
  const bookmarkPost = async () => {
    if (hasbookmarked) {
      await deleteDoc(doc(db, "posts", id, "bookmark", session.user.uid));
    } else {
      await setDoc(doc(db, "posts", id, "bookmark", session.user.uid), {
        username: session.user.username,
      });
    }
  };

  const sendComment = async (e) => {
    e.preventDefault();

    const commentToSend = comment.trim();

    await addDoc(collection(db, "posts", id, "comments"), {
      comment: commentToSend,
      username: session.user.username,
      profileImg: session.user.image,
      timestamp: serverTimestamp(),
    });

    setComment("");
  };

  const handleOpenDeleteModal = () => {
    // Pass the post ID to the modal
    setOpenDeleteModal({ open: true, postId: id });
  };

  return (
    <div className="bg-white my-7 border rounded-sm">
      {/* Header  */}
      <div className="flex items-center p-5">
        <img
          src={userImg}
          alt="avatar"
          className="rounded-full h-12 w-12 object-contain border p-1 mr-3 "
        />
        <p className="flex-1 font-bold ">{username}</p>
        {session?.user?.username === username && (
          <DotsHorizontalIcon
            onClick={handleOpenDeleteModal}
            className="h-5 cursor-pointer"
          />
        )}
      </div>

      {/* Img  */}
      <img src={img} alt="image" className="object-cover w-full" />

      {/* Buttons  */}

      {session && (
        <div className="flex justify-between px-4 pt-4 ">
          <div className="flex space-x-4">
            {hasLiked ? (
              <HeartIconFilled
                onClick={likePost}
                className="btn text-red-600"
              />
            ) : (
              <HeartIcon onClick={likePost} className="btn" />
            )}
            <ChatIcon className="btn" />
            <PaperAirplaneIcon className="btn rotate-45" />
          </div>

          {hasbookmarked ? (
            <BookmarkIconFilled onClick={bookmarkPost} className="btn" />
          ) : (
            <BookmarkIcon onClick={bookmarkPost} className="btn" />
          )}
        </div>
      )}
      {/* Caption  */}

      <p className="p-5 truncate">
        {likes.length > 0 && (
          <p className="font-bold mb-1">{likes.length} likes</p>
        )}

        <span className="font-bold mr-1">{username} </span>
        {caption}
      </p>

      {/* Comment  */}

      {comments.length > 0 && (
        <div className="ml-10 h-20 overflow-y-scroll scrollbar-thumb-black scrollbar-thin">
          {comments.map((comment) => (
            <div className="flex items-center space-x-2 mb-3" key={comment.id}>
              <img
                src={comment.data().profileImg}
                alt="img"
                className="h-7 rounded-full"
              />
              <p className="text-sm flex-1">
                <span className="font-bold">{comment.data().username} </span>{" "}
                {comment.data().comment}
              </p>
              <Moment fromNow className="pr-5 text-xs">
                {comment.data().timestamp?.toDate()}
              </Moment>
            </div>
          ))}
        </div>
      )}

      {/* Input Base  */}

      {session && (
        <form className="flex items-center p-4">
          <EmojiHappyIcon className="h-7" />
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className=" border-none flex-1 focus:ring-0 outline-none"
            placeholder="Add a comment..."
          />

          <button
            type="submit"
            disabled={!comment.trim()}
            onClick={sendComment}
            className="font-semibold text-blue-500"
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
};

export default Post;
