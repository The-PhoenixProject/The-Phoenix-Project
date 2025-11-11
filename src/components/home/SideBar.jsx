import React from "react";
import "../../styles/Home/SideBar.css";

const Sidebar = () => {
  const quickAccess = [
    { icon: "bi-images", label: "My Photos", href: "#" },
    { icon: "bi-chat-dots", label: "My Posts", href: "#" },
    { icon: "bi-bookmark", label: "Saved Posts", href: "#" },
    { icon: "bi-bag", label: "My Products", href: "#" },
    { icon: "bi-gear", label: "Settings", href: "#" },
  ];

  const trendingHashtags = [
    "#SustainableLiving",
    "#EcoFriendly",
    "#RecycleMore",
    "#GreenAction",
    "#Sustainability",
    "#ZeroWaste",
  ];

  return (
    <aside className="sidebar-custom  p-3">
      <div className="sidebar-section p-3 rounded">
        <h6 className="sidebar-title">Quick Access</h6>
        <div className="menu-items">
          {quickAccess.map((item, index) => (
            <a key={index} href={item.href} className="menu-item">
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="sidebar-section mt-5 p-3 rounded">
        <h6 className="sidebar-title">Trending Hashtags</h6>
        <div className="hashtags-list">
          {trendingHashtags.map((tag, index) => (
            <a key={index} href="#" className="hashtag-item">
              {tag}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
