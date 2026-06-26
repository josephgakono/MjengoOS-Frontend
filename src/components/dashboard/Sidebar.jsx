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

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) {
  const menuItems = [
    {
      name: "Dashboard",
      tab: "dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "My Jobs",
      tab: "jobs",
      icon: <Briefcase size={20} />,
    },
    {
      name: "Quotations",
      tab: "quotations",
      icon: <FileText size={20} />,
    },
    {
      name: "Projects",
      tab: "projects",
      icon: <FolderKanban size={20} />,
    },
    {
      name: "Escrow Center",
      tab: "escrow",
      icon: <ShieldCheck size={20} />,
    },
    {
      name: "Payments",
      tab: "payments",
      icon: <CreditCard size={20} />,
    },
    {
      name: "Messages",
      tab: "messages",
      icon: <MessageSquare size={20} />,
    },
    {
      name: "Reviews",
      tab: "reviews",
      icon: <Star size={20} />,
    },
    {
      name: "Profile",
      tab: "profile",
      icon: <User size={20} />,
    },
  ];

  return (
    <>
      <div
        className={sidebarOpen ? "sidebar-overlay active" : "sidebar-overlay"}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="logo-section">
          <h2>MjengoOS</h2>
          <span>Building the future, together</span>
        </div>
        <nav>
          {menuItems.map((item) => (
            <button
              key={item.tab}
              className={
                activeTab === item.tab ? "sidebar-link active" : "sidebar-link"
              }
              onClick={() => {
                setActiveTab(item.tab);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="support-card">
          <h4>Need Help?</h4>
          <p>Our support team is here to help.</p>

          <button>Contact Support</button>
        </div>
      </aside>
    </>
  );
}
