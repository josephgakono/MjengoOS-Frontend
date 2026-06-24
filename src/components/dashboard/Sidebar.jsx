import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FolderKanban,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Star,
  User,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/customer/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "My Jobs",
      path: "/customer/jobs",
      icon: <Briefcase size={20} />,
    },
    {
      name: "Quotations",
      path: "/customer/quotations",
      icon: <FileText size={20} />,
    },
    {
      name: "Projects",
      path: "/customer/projects",
      icon: <FolderKanban size={20} />,
    },
    {
      name: "Escrow Center",
      path: "/customer/escrow",
      icon: <ShieldCheck size={20} />,
    },
    {
      name: "Payments",
      path: "/customer/payments",
      icon: <CreditCard size={20} />,
    },
    {
      name: "Messages",
      path: "/customer/messages",
      icon: <MessageSquare size={20} />,
    },
    {
      name: "Reviews",
      path: "/customer/reviews",
      icon: <Star size={20} />,
    },
    {
      name: "Profile",
      path: "/customer/profile",
      icon: <User size={20} />,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <h2>MjengoOS</h2>
        <span>Building the future, together</span>
      </div>

      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="support-card">
        <h4>Need Help?</h4>
        <p>
          Our support team is here to help.
        </p>

        <button>Contact Support</button>
      </div>
    </aside>
  );
}