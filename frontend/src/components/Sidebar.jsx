import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css'; // Buat styling sesuai kebutuhan

const menuItems = [
  {
    title: 'Dashboard',
    icon: '📊',
    submenu: [
      { title: 'Overview', path: '/dashboard/overview' },
      { title: 'Global Traffic', path: '/dashboard/global-traffic' },
      { title: 'Performance Metrics', path: '/dashboard/performance' },
    ],
  },
  {
    title: 'Message Management',
    icon: '💬',
    submenu: [
      { title: 'Send Message', path: '/send-message' },
      { title: 'Bulk Messaging', path: '/bulk-messaging' },
      { title: 'Message Templates', path: '/templates' },
      { title: 'Auto Replies', path: '/auto-replies' },
      { title: 'Chat Logs', path: '/chat-logs' },
      { title: 'Chat', path: '/chat' },  // Tambahkan item ini untuk chat dua arah
    ],
  },
  {
    title: 'Contacts & Users',
    icon: '👥',
    submenu: [
      { title: 'Contact List', path: '/contacts' },
      { title: 'Contact Segmentation', path: '/contact-segmentation' },
      { title: 'User Management', path: '/users' },
    ],
  },
  {
    title: 'WhatsApp Business API',
    icon: '🔑',
    submenu: [
      { title: 'API Keys & Credentials', path: '/api-keys' },
      { title: 'Webhook Settings', path: '/webhook-settings' },
      { title: 'Delivery Reports', path: '/delivery-reports' },
      { title: 'Regional API Config', path: '/regional-config' },
      { title: 'Compliance & Policies', path: '/compliance' },
    ],
  },
  {
    title: 'Automation & Chatbots',
    icon: '🤖',
    submenu: [
      { title: 'Chatbot Builder', path: '/chatbot-builder' },
      { title: 'Chatbot Rules', path: '/chatbot-rules' },
      { title: 'Chatbot Analytics', path: '/chatbot-analytics' },
      { title: 'Integrations', path: '/chatbot-integrations' },
    ],
  },
  {
    title: 'Analytics & Reports',
    icon: '📊',
    submenu: [
      { title: 'Messaging Insights', path: '/messaging-insights' },
      { title: 'Export Reports', path: '/export-reports' },
      { title: 'User Activity Logs', path: '/activity-logs' },
      { title: 'SLA Monitoring', path: '/sla-monitoring' },
    ],
  },
  {
    title: 'System Settings',
    icon: '⚙️',
    submenu: [
      { title: 'Security Settings', path: '/security-settings' },
      { title: 'File Storage', path: '/file-storage' },
      { title: 'API Configuration', path: '/api-config' },
      { title: 'Logs & Debugging', path: '/logs' },
    ],
  },
  {
    title: 'User Management & Roles',
    icon: '👤',
    submenu: [
      { title: 'Manage Users', path: '/manage-users' },
      { title: 'Role & Permissions', path: '/roles' },
      { title: 'Notification Settings', path: '/notifications' },
      { title: 'Session Management', path: '/sessions' },
    ],
  },
  {
    title: 'Help & Support',
    icon: '❓',
    submenu: [
      { title: 'Documentation', path: '/documentation' },
      { title: 'FAQ', path: '/faq' },
      { title: 'Contact Support', path: '/support' },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>WhatsApp Center</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className={activeMenu === index ? 'active' : ''}>
              <div className="menu-item" onClick={() => toggleMenu(index)}>
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-title">{item.title}</span>
              </div>
              {item.submenu && activeMenu === index && (
                <ul className="submenu">
                  {item.submenu.map((sub, subIndex) => (
                    <li key={subIndex} className={location.pathname === sub.path ? 'active' : ''}>
                      <Link to={sub.path}>{sub.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;