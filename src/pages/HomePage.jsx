import React, { useState } from "react";
import SideBar from "../components/home/SideBar";
import CreatePost from "../components/home/post/CreatePost";
import PostCard from "../components/home/post/PostCard";
import FriendsList from "../components/home/FriendsList";
import "../styles/Home/HomePage.css";

const HomePage = () => {
  const logoIcon = "/assets/landingImgs/logo-icon.png";
  
  const currentUser = {
    name: "Jane Doe",
    avatar: logoIcon,
    subtitle: "Online now",
  };

  const [posts] = useState([
    {
      id: 1,
      author: {
        name: "Alex Thompson",
        avatar: logoIcon,
      },
      content:
        "Just finished my DIY planter project using old plastic bottles! It's amazing how we can give new life to items that would otherwise end up in landfills.",
      image: "/assets/landingImgs/glassPlantersSet.png",
      tags: ["Recycled", "DIY", "#SustainableLiving"],
      likes: 42,
      comments: 7,
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      author: {
        name: "Sarah Chen",
        avatar: logoIcon,
      },
      content:
        "Week 3 of my zero-waste challenge: Managing to fit all my waste in a single jar. The key is learning about packaging and bringing reusable containers everywhere.",
      image: "/assets/landingImgs/bag.png",
      tags: ["EcoFriendly", "#ZeroWaste", "Sustainability"],
      likes: 65,
      comments: 12,
      timestamp: "4 hours ago",
    },
  ]);

  return (
    <div className="homepage-container">
      <div className="container-fluid">
        <div className="row g-4">
          {/* Left Sidebar */}
          <div className="col-lg-3">
            <SideBar />
          </div>

          {/* Main Content */}
          <div className="col-lg-6">
            <CreatePost currentUser={currentUser} />

            <div className="posts-feed">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Friends & Trending */}
          <div className="col-lg-3">
            <FriendsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
