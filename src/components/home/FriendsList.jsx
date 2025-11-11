import React from "react";
import "/src/styles/Home/RightSideBar.css";

const FriendsList = () => {
  const friends = [
    {
      id: 1,
      name: "Haya Singh",
      avatar: "https://via.placeholder.com/40",
      status: "Online",
    },
    {
      id: 2,
      name: "David Park",
      avatar: "https://via.placeholder.com/40",
      status: "Online",
    },
    {
      id: 3,
      name: "Olivia Lee",
      avatar: "https://via.placeholder.com/40",
      status: "Online",
    },
    {
      id: 4,
      name: "Haya Singh",
      avatar: "https://via.placeholder.com/40",
      status: "Online",
    },
    {
      id: 5,
      name: "Olivia Lee",
      avatar: "https://via.placeholder.com/40",
      status: "Online",
    },
  ];

  const popularHashtags = [
    "#Sustainability",
    "#EcoFriendly",
    "#RecycleMore",
    "#GreenAction",
    "#ClimateAction",
  ];

  return (
    <div className="right-sidebar-container ">
      {/* Friends Section */}
      <div className=" friends-card ">
        <div className="card-header pb-4 ">
          <h6 className="mb-0 fw-bold">Friends</h6>
        </div>
        <div className="card-body p-0">
          <div className="friends-list">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="friend-item d-flex justify-content-between align-items-center p-3 mb-2 rounded"
              >
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="rounded-circle"
                    width="40"
                    height="40"
                  />
                  <div>
                    <h6 className="mb-0 small">{friend.name}</h6>
                    <small className="text-muted">{friend.status}</small>
                  </div>
                </div>
                <button className="btn btn-sm orangebtn">+ Follow</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Hashtags Section */}
      <div className="hashtags-card ">
        <div className="card-header pb-3">
          <h6 className="mb-0 fw-bold">Popular Hashtags</h6>
        </div>
        <div className="card-body">
          <div className="hashtags-list">
            {popularHashtags.map((tag, index) => (
              <a
                key={index}
                href="#"
                className="hashtag-link d-block mb-2 orangeText"
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsList;
